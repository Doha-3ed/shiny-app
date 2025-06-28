import CartModel from "../../DB/models/cart.model.js";
import OrderModel from "../../DB/models/order.model.js";
import PharmacyModel from "../../DB/models/pharmacy.model.js";
import productModel from "../../DB/models/product.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import { customAlphabet, nanoid } from "nanoid";
import mongoose from "mongoose"
import { connectionUser, createNotification } from "../notification/notification.service.js";


export const getAvailablePharmacies = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await CartModel.findOne({ userId });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    console.log("🛒 Cart Products:", cart.products);

    const pharmacyMap = new Map();

    for (const item of cart.products) {
      const quantity = item.quantity || 1;
      const productId = item.productId.toString();

      console.log("🔍 Checking product:", productId, "Quantity:", quantity);

      const products = await productModel.find({
        _id: item.productId, // حذف new ObjectId
        stock: { $gte: quantity }
      });

      console.log("🔎 Found products for", productId, "=>", products.map(p => ({
        _id: p._id,
        pharmacyId: p.pharmacyId,
        stock: p.stock
      })));

      products.forEach((product) => {
        const pid = product.pharmacyId.toString();
        if (!pharmacyMap.has(pid)) {
          pharmacyMap.set(pid, new Set());
        }
        pharmacyMap.get(pid).add(productId);
      });
    }

    const requiredProductIds = cart.products.map(p => p.productId.toString());
    console.log("🎯 Required Product IDs:", requiredProductIds);

    console.log("📦 Final pharmacyMap:");
    for (const [pharmacyId, productSet] of pharmacyMap.entries()) {
      console.log(`Pharmacy: ${pharmacyId} has products:`, [...productSet]);
    }

    const validPharmacyIds = [];

    for (const [pharmacyId, productSet] of pharmacyMap.entries()) {
      const hasAll = requiredProductIds.every(id => productSet.has(id));
      if (hasAll) {
        validPharmacyIds.push(pharmacyId);
      }
    }

    console.log("✅ Valid pharmacy IDs:", validPharmacyIds);

    const pharmacies = await PharmacyModel.find({
      userId: { $in: validPharmacyIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).populate('userId', 'name');

    const result = pharmacies.map(pharmacy => ({
      _id: pharmacy._id,
      name: pharmacy.userId ? pharmacy.userId.name : 'Unknown Pharmacy',
      userId: pharmacy.userId,
      isApproved: pharmacy.isApproved,
      location: pharmacy.location,
      licenseNumber: pharmacy.licenseNumber,
      products: pharmacy.products,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    }));
    res.status(200).json({
      success: true,
      pharmacies: result,
    });

  } catch (err) {
    next(err);
  }
});


export const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { pharmacyId, phone, address } = req.body;

    const cart = await CartModel.findOne({ userId }).populate('products.productId');
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

  console.log("pharmacyId",pharmacyId)
    for (const item of cart.products) {
      const product = await productModel.findOne({
        _id: item.productId,
        pharmacyId,
      });
      console.log("🧪 Products matching _id only:",product);
      if (!product) {
        return res.status(400).json({
          message: `Product with ID ${item.productId} is not available in the selected pharmacy`
        });
      }
    }

    // Reduce stock
    for (const item of cart.products) {
      await productModel.updateOne(
        { _id: item.productId, pharmacyId },
        { $inc: { stock: -item.quantity } }
      );
    }

    const orderNo = customAlphabet("0123456789", 4)();
    const order = await OrderModel.create({
      userId,
      cartId: cart._id,
      pharmacyId,
      totalPrice: cart.subTotal,
      phone,
      address,
      orderNo,
      paymentMethod: 'cash',
      orderStatus: 'pending'
    });
const notification=await createNotification({
      recipient: pharmacyId,
       sender: userId,
       type: 'order',
       payload: {
         orderId: order._id,
         orderNo: order.orderNo,
         address: order.address,
         phone: order.phone,
         totalPrice: order.totalPrice,
         items: cart.products.map(p => ({
           name: p.productId.name,
           image: p.productId.image,
           quantity: p.quantity
         }))
       }
    });
console.log("🔔 Notification created:", notification)
    // 7. إرسال إشعار فوري عبر Socket.IO
    const io = req.app.get('socketio');
    const pharmacySockets = connectionUser.get(pharmacyId.toString());
    
    if (pharmacySockets && pharmacySockets.size > 0) {
      io.to([...pharmacySockets]).emit('new_order', {
        address:order.address,
       phone:order.phone,
        orderNo: order.orderNo,
        totalPrice: order.totalPrice,
        timestamp: new Date()
      });
    }
    const cartItemsDetailed = cart.products.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity,
    }));

    // 8. Clear cart
    cart.products = [];
    cart.subTotal = 0;
    await cart.save();

    // 9. Send response
    res.status(201).json({
      msg: 'Order created successfully',
      success: true,
      orderNo: order.orderNo,
      orderId: order._id,
      address: order.address,
      phone: order.phone,
      totalPrice: order.totalPrice,
      cartItems: cartItemsDetailed,
      notification: {
        type: notification.type,
        payload: notification.payload,
        createdAt: notification.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});



  export const getAllOrders = asyncHandler(async (req, res, next) => {
    try {
      const orders = await OrderModel.findOne({userId: req.user._id}).populate('userId ');

      res.status(200).json({ msg: 'Orders fetched successfully', orders });
    } catch (err) {
      next(err);
    }
  })  

