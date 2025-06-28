import doctorModel from "../../DB/models/doctor.model.js";
import PharmacyModel from "../../DB/models/pharmacy.model.js";
import userModel from "../../DB/models/user.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";

export const banUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findOne({ _id: userId, isConfirmed: true });
    if (!user) {
      return next(new Error("user not Found"));
    }
    let banUser;
    if (user.bannedAt == null) {
      banUser = await userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { bannedAt: new Date() } },
        { new: true }
      );
    } else {
      banUser = await userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { bannedAt: null } },
        { new: true }
      );
    }
    res.status(201).json({ msg: "done", banUser });
  });

  export const verifyDoctor = asyncHandler(async (req, res, next) => {
    const doctorId = req.params;
    const { licenseNumber, certification } = req.body;
  
    const doctor = await doctorModel.findById(doctorId);
  
    if (!doctor) {
      return next(new Error("Doctor not found"));
    }
  
    // Optional: Adjust this logic to match how you store certification (object vs string)
    const isCertified = (
      doctor.licenseNumber === licenseNumber &&
      doctor.certification?.public_id === certification?.public_id // if using cloudinary object
    );
  
    if (!isCertified) {
      return next(new Error("Verification failed"));
    }
  
    doctor.is_verified = true;
    await doctor.save();
  
    res.status(200).json({
      success: true,
      message: "Doctor verified successfully",
      doctor,
    });
  });

  export const PharmacyApproval = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
  
    const pharmacy = await PharmacyModel.findById(id).populate("userId", "name email");
    if (!pharmacy) {
      return next(new Error("Pharmacy not found"));
    }
  
    let updatedPharmacy;
  
    // Toggle approval
    if (pharmacy.isApproved) {
      updatedPharmacy = await PharmacyModel.findByIdAndUpdate(
        id,
        { $set: { isApproved: false } },
        { new: true }
      );
    } else {
      updatedPharmacy = await PharmacyModel.findByIdAndUpdate(
        id,
        { $set: { isApproved: true } },
        { new: true }
      );
    }
  
    res.status(200).json({
      msg: "Approval status updated",
      pharmacy: updatedPharmacy,
    });
  });