import mongoose from "mongoose";


import appointmentModel from "./appointment.model.js";
import postModel from "./post.model.js";



const doctorSchema = new mongoose.Schema(
  {
   
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
     
    },
    clinicName: {
      type: String,
      unique: true,
      required: true,
    },
    specialization: String,
   experience: String,
    
    clinicPhone: String,
    clinicLocation: String,
    licenseNumber: String,
    
    is_verified: { type: Boolean, default: false },
    certification: {
      secure_url: String,
      public_id: String,
    },
    availableSlots:{type:String,default:"add your Clinic Hours"},
      rating: { type: Number, default: 0 },
      reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }],
      about:{type: String,
              default: " add Your Bio",
            },
  },
  {
    timestamps: true,
  }
);
doctorSchema.virtual('appointments', {
  ref: 'appointment',
  localField: '_id',
  foreignField: 'doctorId',
});
doctorSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  await mongoose.model("user").deleteOne({ _id: this.userId });
  next();
})
doctorSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    await mongoose.model("user").findByIdAndDelete(docToDelete.userId);
  }
  next();
});
doctorSchema.set('toObject', { virtuals: true });
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await appointmentModel.deleteMany({ doctorId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
doctorSchema.pre('findOneAndDelete', { document: true, query: false }, async function (next) {
  try {
    await postModelModel.deleteMany({ doctorId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});


  
const doctorModel = mongoose.model.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
