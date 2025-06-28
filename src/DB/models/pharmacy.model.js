import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  isApproved: { type: Boolean, default: false },
  location:  {
   
    type:String,required:true
  },
  licenseNumber: { type: String, required: true },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'
  }]
},{
  timestamps: true,
}
);
pharmacySchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    await mongoose.model("user").findByIdAndDelete(docToDelete.userId);
  }
  next();
})
const PharmacyModel = mongoose.model.Pharmacy || mongoose.model("Pharmacy", pharmacySchema);
export default PharmacyModel;