import { title } from "process";
import CartModel from "../../DB/models/cart.model.js";
import productModel from "../../DB/models/product.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const createCart = asyncHandler(async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await productModel.findOne({
      _id: productId,
      stock: { $gte: quantity }
    });

    if (!product) {
      return next(new Error("Product does not exist or stock is not available"));
    }

    let cart = await CartModel.findOne({ userId });

    const finalPrice = product.price * quantity;

    if (!cart) {
      // Create new cart
      const newCart = await CartModel.create({
        userId,
        products: [{
          productId,
          quantity,
          finalPrice
        }]
      });

      const rawCart = await CartModel.findById(newCart._id).populate({
        path: "products.productId",
        select: "title price image"
      });

      const formattedProducts = rawCart.products.map(p => ({
        _id: p.productId._id,
        title: p.productId.title,
        price: p.productId.price,
       image: {
          secure_url: p.productId.image?.secure_url || ""
        },
        quantity: p.quantity,
        finalPrice: p.finalPrice
      }));

      return res.status(201).json({
        success: true,
        msg: "Cart created successfully",
        cart: {
          _id: rawCart._id,
          products: formattedProducts,
          subTotal: rawCart.subTotal
        }
      });
    }

    // Check if product already in cart
    const productExists = cart.products.find(p => p.productId.toString() === productId);
    if (productExists) {
      return next(new Error("Product already exists in cart"));
    }

    // Add product to existing cart
    cart.products.push({
      productId,
      quantity,
      finalPrice
    });

    await cart.save();

    const rawCart = await CartModel.findById(cart._id).populate({
      path: "products.productId",
      select: "title price image"
    });

    const formattedProducts = rawCart.products.map(p => ({
      _id: p.productId._id,
      title: p.productId.title,
      price: p.productId.price,
      image: {
          secure_url: p.productId.image?.secure_url || ""
        },
      quantity: p.quantity,
      finalPrice: p.finalPrice
    }));

    return res.status(200).json({
      success: true,
      msg: "Product added to cart successfully",
      cart: {
        _id: rawCart._id,
        products: formattedProducts,
        subTotal: rawCart.subTotal
      }
    });

  } catch (err) {
    next(err);
  }
});

  //----------------------------------------------------------------removeFromCart--------------------------------------------------------------------  
  export const removeFromCart = asyncHandler(async (req, res, next) => {
    try {
        const { productId } = req.body; // Ensure this comes from body or params
        const userId = req.user._id; // Assuming `req.user` is populated via auth middleware
    
        const Product = await productModel.findOne({ _id: productId });
        if (!Product) {
          return next(new Error( "Product does not exist or stock not available"));
        }
    
        const cart = await CartModel.findOne({
          userId,
          products: { $elemMatch: { productId } },
        });
    
        if (!cart) {
          return next(new Error("Product not found in cart"));
        }
    
        cart.products = cart.products.filter(
          (product) => product.productId.toString() !== productId
        );
    
        await cart.save();
    
        return res.status(200).json({ msg: "Product removed from cart",success: true, cart });
      } catch (err) {
        next(err); // Pass to global error handler
      }
  })
  //------------------------------------------------------------updateCart-----------------------------------------------------------------------
  export const UpdateCart = asyncHandler(async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Assuming authentication middleware sets this

    const cart = await CartModel.findOne({
      userId,
      products: { $elemMatch: { productId } },
    });

    if (!cart) {
      return next(new Error("Cart not found"));
    }

    let productInCart = cart.products.find(
      (product) => product.productId.toString() === productId.toString()
    );

    if (!productInCart) {
      return next(new Error("Product not found in cart"));
    }

    const product = await productModel.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });

    if (!product) {
      return next(new Error("Product not exist or stock not available"));
    }

    productInCart.quantity = quantity;
    productInCart.finalPrice = product.price * quantity;

    await cart.save();

    const updatedCart = await CartModel.findById(cart._id).populate({
      path: "products.productId",
      select: "title price image "
    });

    return res.status(200).json({
      msg: "Cart updated successfully",
      success: true,
      cart: updatedCart
    });

  } catch (err) {
    next(err);
  }
});

  //------------------------------------------------------------getCart-----------------------------------------------------------------------
  export const getCart = asyncHandler(async (req, res, next) => {
    try {
      const userId = req.user._id;

      const cart = await CartModel.findOne({ userId }).populate({
        path: "products.productId",
        select: "title image type price "
      });

      if (!cart) {
        return next(new Error("Cart not found"));
      }

      const formattedProducts = cart.products.map(p => {
        const prod = p.productId;
        return {
          _id: prod._id,
          title: prod.title,
          image: {
            secure_url: prod.image?.secure_url || ""
          },
          type: prod.type,
          price: prod.price,
          
          quantity: p.quantity,
          finalPrice: p.finalPrice
        };
      });

      return res.status(200).json({
        success: true,
        msg: "Cart fetched successfully",
        cart: {
          _id: cart._id,
          products: formattedProducts,
          subTotal: cart.subTotal
        }
      });
    } catch (err) {
      next(err);
    }
  });
