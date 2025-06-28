import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true, // One wishlist per user
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
    },
  ],
}, { timestamps: true });

const WishlistModel = mongoose.models.Wishlist || 
                mongoose.model("Wishlist", wishlistSchema);

export default WishlistModel;