
import PharmacyModel from "../../DB/models/pharmacy.model.js";
import productModel from "../../DB/models/product.model.js";
import cloudinary from "../../utilities/cloudnairy/index.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const addProduct = asyncHandler(async (req, res, next) => {
  const pharmacyId = req.user?._id;
  const { description, price, type, category,title } = req.body;

  if (!req.file) {
    return next(new Error("No file uploaded"));
  }

  const productPic = await cloudinary.uploader.upload(req.file.path,{
    folder: 'pharmacies/products'
  });

  

const product = await productModel.create({
  title,
  content: description,
  price,
  type,
  targetType: category,
  image: {
    secure_url: productPic.secure_url,
    public_id: productPic.public_id,
  },
  quantity: 50,
  pharmacyId,
});

  if (!product) {
    return next(new Error("Product not added"));
  }

  const updatedPharmacy = await PharmacyModel.findOneAndUpdate(
    { userId: pharmacyId },
    { $addToSet: { products: product._id } },
    { new: true }
  );
  console.log("تم التحديث:", updatedPharmacy);

  res.status(201).json({
    msg: "Product added",
    product: {
      description: product.content,
      price: product.price,
      type: product.type,
      category: product.targetType,
      image: product.image,
      title:product.title
    },
  });
});
export const updateProduct = asyncHandler(async (req, res) => {
    
  if(req.file){
    const productPic = await cloudinary.uploader.upload(req.file.path,{
      folder: 'pharmacies/products'
    });
    req.body.image = {
      secure_url: productPic.secure_url,
      public_id: productPic.public_id,
    };
  }
    const product = await productModel.findOneAndUpdate(
      { pharmacyId: req.user.id },
      { ...req.body },
      { new: true, lean: true }
    );
  
    if (!product) {
      return next(new Error("Product not found"));
    }
  
    res.status(201).json({ msg: "Product updated", product });
  });   
  export const deleteProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
  
    const product = await productModel.findOneAndDelete(
      {
        _id: productId,
        pharmacyId: req.user.id, // ensures the product belongs to the authenticated pharmacy
      },
      { new: true, lean: true }
    );
  
    if (!product) {
      return next(new Error("Product not found or unauthorized"));
    }
  
    // 🔁 Remove the product from the pharmacy's products array
    await PharmacyModel.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { products: product._id } }
    );
  
    res.status(200).json({ msg: "Product deleted", product });
  });
  
  export const getProducts = asyncHandler(async (req, res) => {
    const products = await productModel.find({ pharmacyId: req.user.id });
  
    if (!products) {
      return next(new Error("Products not found"));
    }
  
    res.status(200).json({ msg: "Products fetched", products });
  });

  export const getProductById = asyncHandler(async (req, res) => {
    const {id} = req.params
  
    const product = await productModel.findOne({
      _id:id,
      pharmacyId: req.user.id, // ensures the product belongs to the authenticated pharmacy
    });
  
    if (!product) {
      return next(new Error("Product not found or unauthorized"));
    }
  
    res.status(200).json({ msg: "Product fetched", product });
  });

  export const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await productModel.find();
  
    if (!products || products.length === 0) {
      return next(new Error("No products found"));
    }
  
    const formattedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      type: product.type,
     likes: product.likes,
      image: product.image
    }));
  
    res.status(200).json({ msg: "Products fetched", products: formattedProducts });
  });
  

  export const searchProduct = asyncHandler(async (req, res, next) => {
    try {
      const {
        name,
        type,
        targetType,
        price,
        location
      } = req.query;
  
      const filter = {};
  
      if (name) {
        filter.name = { $regex: name, $options: "i" };
      }
  
      if (type) {
        filter.type = { $regex: type, $options: "i" };
      }
  
      if (targetType) {
        filter.targetType = { $regex: targetType, $options: "i" };
      }
  
      if (price) {
        const parsedPrice = parseFloat(price);
        filter.price = { $gte: parsedPrice - 10, $lte: parsedPrice + 10 };
      }
  
      let products = await productModel
        .find(filter)
        .populate({
          path: "pharmacyId",
          select: "location userId",
          populate: {
            path: "userId",
            select: "name  phoneNumber profileImage"
          }
        });
  
      // Filter by pharmacy location (as a string match)
      if (location) {
        const locationRegex = new RegExp(location, "i");
        products = products.filter(product =>
          locationRegex.test(product?.pharmacyId?.location)
        );
      }
  
      res.status(200).json({
        success: true,
        data: products,
      });
  
    } catch (err) {
      next(err);
    }
  });
  export const getSpecificProduct =asyncHandler(async (req, res, next) =>{
    const {id} = req.params
    const product = await productModel.findOne({_id:id}).select("title price type targetType likes content image")
    if (!product) {
      return next(new Error("Product not found"));
    }
    res.status(200).json({
      success:true,
        data:product
    })
  })