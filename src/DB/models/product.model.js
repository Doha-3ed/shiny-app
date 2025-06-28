// models/Product.js
import mongoose from "mongoose";
import PharmacyModel from "./pharmacy.model.js";


const productSchema = new mongoose.Schema({
  title: { type: String,},
  content: { type: String, required: true },
  price: {
    type: Number,
    required: true
  },
  type: { type: String, enum: ['skin', 'hair','body'], required: true },
  targetType: { type: String, required: true }, // e.g., "dry skin", "oily hair"
  image: {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  pharmacyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pharmacy', 
    
  },
  stock: { type: Number, default: 50 },
  quantity: { type: Number },
  likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }]
  
}
,{
  timestamps: true
});
productSchema.pre("save", function (next) {
  if (this.isNew && this.quantity !== undefined) {
    this.stock = this.quantity;
  }
  next();
});
productSchema.methods.purchase = async function (purchaseQty) {
  if (this.stock < purchaseQty) {
    throw new Error("Not enough stock available");
  }

  this.stock -= purchaseQty;
  const totalPrice = this.price * purchaseQty;

  await this.save();
  productSchema.post("save", async function (doc) {
    await PharmacyModel.findByIdAndUpdate(doc.pharmacyId, {
      $addToSet: { products: doc._id }
    });
  });
  
  /** Remove product from pharmacy after delete */
  productSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
      await PharmacyModel.findByIdAndUpdate(doc.pharmacyId, {
        $pull: { products: doc._id }
      });
    }
  });
  return { totalPrice, remainingStock: this.stock };
};

const productModel = mongoose.model.product || mongoose.model("product", productSchema);
export default productModel;
