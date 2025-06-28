import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Make sure 'User' matches the actual model name
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Make sure 'Product' matches the actual model name
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      finalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  subTotal: {
    type: Number,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartSchema.pre('save', function (next) {
  this.subTotal = this.products.reduce((acc, prod) => acc + prod.finalPrice, 0);
  next();
});
const CartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);
export default CartModel;
