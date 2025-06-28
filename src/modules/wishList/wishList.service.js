import productModel from "../../DB/models/product.model.js";
import WishlistModel from "../../DB/models/wishList.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const createWishlist =asyncHandler( async (req, res,next) => {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
  
      const product = await productModel.findById(productId);
      if (!product) return next(new Error("Product not found"));
  
      let wishlist = await WishlistModel.findOne({ userId });
  
      if (!wishlist) {
        wishlist = await WishlistModel.create({ userId, products: [productId] });
      } else {
        if (wishlist.products.includes(productId)) {
          return next(new Error("Product already in wishlist"));
        }
        wishlist.products.push(productId);
        await wishlist.save();
      }
  
      // Populate product details
      const populatedWishlist = await WishlistModel.findById(wishlist._id)
        .populate('products', 'title price image type'); // You can also specify fields like .populate('products', 'name price image')
  
      res.status(200).json({ msg: 'Product added to wishlist', wishlist: populatedWishlist });
  
    } catch (error) {
      next(error);
    }
  })

  export const removeFromWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.body;
  
    const wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) return next(new Error('Wishlist not found'));
  
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
  
    res.status(200).json({ msg: 'Product removed from wishlist', wishlist });
  })

 export const getWishlist = asyncHandler(async (req, res, next) => {
   const userId = req.user._id;

   const wishlist = await WishlistModel.findOne({ userId })
     .populate({ path: 'products', select: 'title price image likes type' });

   // لو مفيش wishlist، رجع قائمة فاضية
   if (!wishlist) {
     return res.status(200).json({
       msg: 'Wishlist fetched',
       wishlist: {
         products: []
       }
     });
   }

   // لو الـ wishlist موجودة لكن المنتجات فاضية
   if (wishlist.products.length === 0) {
     return res.status(200).json({
       msg: 'Wishlist fetched',
       wishlist: {
         products: []
       }
     });
   }

   // في منتجات بالفعل
   res.status(200).json({
     msg: 'Wishlist fetched',
     wishlist
   });
 });


   export const likeProduct = asyncHandler(async (req, res, next) => {
     const { productId } = req.params;
     const userId = req.user._id;

     const product = await productModel.findById(productId);
     if (!product) return next(new Error("Product not found"));

     let updatedProduct;
     let action;
     let updatedWishlist;

     const hasLiked = product.likes.includes(userId.toString());

     if (hasLiked) {
       // Remove like
       updatedProduct = await productModel.findByIdAndUpdate(
         productId,
         { $pull: { likes: userId } },
         { new: true }
       );

       // Remove from wishlist
       updatedWishlist = await WishlistModel.findOneAndUpdate(
         { userId },
         { $pull: { products: productId } },
         { new: true }
       ).populate('products', 'title price image likes type');

       action = 'unliked';
     } else {
       // Add like
       updatedProduct = await productModel.findByIdAndUpdate(
         productId,
         { $addToSet: { likes: userId } },
         { new: true }
       );

       let wishlist = await WishlistModel.findOne({ userId });

       if (!wishlist) {
         updatedWishlist = await WishlistModel.create({ userId, products: [productId] });
       } else {
         // تأكد من أن المنتجات متاحة قبل الاستخدام
         const alreadyExists = wishlist.products.some(p => p.toString() === productId);
         if (!alreadyExists) {
           wishlist.products.push(productId);
           await wishlist.save();
         }
         updatedWishlist = await WishlistModel.findById(wishlist._id).populate('products', 'title price image likes type');
       }

       action = 'liked';
     }

     res.status(200).json({
       success: true,
       message: `Product ${action}`,
       product: {
         _id: updatedProduct._id,
         title: updatedProduct.title,
         image: updatedProduct.image,
         type: updatedProduct.type,
         price: updatedProduct.price,
         likes: updatedProduct.likes,
       },
       wishlist: updatedWishlist?.products?.map(p => p._id) || []
     });
   });
