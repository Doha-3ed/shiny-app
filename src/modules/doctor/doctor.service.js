import doctorModel from "../../DB/models/doctor.model.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import mongoose from "mongoose";
import userModel from "../../DB/models/user.model.js";
import { decrypt } from "../../utilities/security/decrypt.js";
import postModel from "../../DB/models/post.model.js";
import Comment from "../../DB/models/comment.model.js";
import cloudinary from "../../utilities/cloudnairy/index.js";
import appointmentModel from "../../DB/models/appointment.model.js"

  //-----------------------------------------------------------------getDoctor--------------------------------------------------------------------
 export const getDoctorById = asyncHandler(async (req, res, next) => {
   const userId = req.user?._id;

   if (!userId) {
     return next(new Error("Doctor ID is required"));
   }

   try {
     // Fetch doctor by userId
     const doctor = await doctorModel
       .findOne({ userId: new mongoose.Types.ObjectId(userId) })
       .select("clinicLocation clinicName specialization about clinicPhone availableSlots ")
       .populate("userId", "name profileImage phoneNumber");

     if (!doctor) {
       return next(new Error("Doctor not found"));
     }

     // Decrypt phone numbers if possible
     try {
       if (doctor.userId?.phoneNumber) {
         doctor.userId.phoneNumber = decrypt(doctor.userId.phoneNumber, process.env.SECRETE_KEY);
       }
       
     } catch (decryptErr) {
       console.warn("Decryption failed:", decryptErr.message);
     }

     // Fetch appointments by doctor._id
     const appointments = await appointmentModel.find({ doctorId: userId });

     // Format appointment date and time
     const formattedAppointments = appointments.map(appointment => ({
       ...appointment.toObject(),
       
       date: formatDate(appointment.date),
     }));
     const posts = await postModel.find({ doctorId:userId })
       .select("content images createdAt")
       .sort({ createdAt: -1 });

     const postIds = posts.map(post => post._id);

       const comments = await Comment.find({
           onModel: "Post",
           refId: { $in: postIds },
           parentId: null,
           isDeleted: false
         })
           .select("content createdAt userId refId")
           .populate("userId", "name profileImage")
           .sort({ createdAt: -1 });

         // 4. Get replies (parentId != null)
         const replies = await Comment.find({
           onModel: "comment",
           parentId: { $ne: null },
           isDeleted: false
         })
           .select("content createdAt userId refId parentId")
           .populate("userId", "name profileImage")
           .sort({ createdAt: -1 }); 
     // Send response once
     return res.status(200).json({
       success: true,
       data: doctor,
       appointments: formattedAppointments,
       posts,
       comments,
       replies
     });
   } catch (error) {
     console.error("Get doctor by ID failed:", error);
     return next(error)
   }
 });

  //--------------------------------ADD ABOUT-------------------------------------------------------------
  export const addAbout=asyncHandler(async(req,res)=>{
    const {userId} = req.user._id;
    const {about} = req.body;
    const doctor = await doctorModel.findOne({userId});
    if(!doctor){
      return res.status(404).json({
        success: false,
        message: "Doctor not found"})
      }
      doctor.about = about;
      await doctor.save();
      return res.status(200).json({
        success: true,
        message: "About added successfully"})
  })

  //--------------------------------ADD AVAILABLE SLOTS-------------------------------------------------------------
   export const addAvailableSlots = asyncHandler(async (req, res, next) => {
  try {
    const doctorId = req.user._id; // this is the authenticated doctor
    const { availableSlots } = req.body; // array of { day, times }

   

    const doctor = await doctorModel.findOne({ userId: doctorId });
    if (!doctor) {
      return next(new Error("Doctor not found"));
    }

    // Update the doctor's available slots (replace existing)
    doctor.availableSlots = availableSlots;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Available slots updated successfully",
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});
  export const getDoctorWithPosts = asyncHandler(async (req, res, next) => {
  const {doctorId} = req.params;

  const doctor = await doctorModel.findOne({userId:doctorId})
    .select("clinicLocation clinicName experience specialization about availableSlots clinicPhone")
    .populate("userId", "name profileImage");
  
  if (!doctor) return next(new Error("Doctor not found"));

  const posts = await postModel.find({ doctorId })
    .select("content images createdAt")
    .sort({ createdAt: -1 });

  const postIds = posts.map(post => post._id);

    const comments = await Comment.find({
        onModel: "Post",
        refId: { $in: postIds },
        parentId: null,
        isDeleted: false
      })
        .select("content createdAt userId refId")
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 });

      // 4. Get replies (parentId != null)
      const replies = await Comment.find({
        onModel: "comment",
        parentId: { $ne: null },
        isDeleted: false
      })
        .select("content createdAt userId refId parentId")
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 }); // You can sort ascending for reply chains

      res.status(200).json({
        success: true,
        data: {
          doctor,
          posts,
          comments,
          replies
        }
      });
    
});

  export const updateDoctor = asyncHandler(async(req,res,next)=>{
    
   
    const doctor = await doctorModel.findOneAndUpdate({userId:req.user._id},{...req.body},{new:true}); 
    if(!doctor){
      return next(new Error("Doctor not found"))
      }
     
      return res.status(200).json({
        success: true,
        message: "doctor updated successfully"})
  })

  //--------------------------------------------------------uploadProfile--------------------------------------------------------------------------------
  export const uploadProfile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }

  const currentUser = await userModel.findById(req.user._id);

  // Delete the old image if it is not the default
  if (currentUser.profileImage?.public_id && currentUser.profileImage.public_id !== "default-image") {
    await cloudinary.uploader.destroy(currentUser.profileImage.public_id);
  }

  // Upload the new image
  const profile = await cloudinary.uploader.upload(req.file.path, {
    folder: 'doctors',
  });

  // Update user's profile image
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: {
        secure_url: profile.secure_url,
        public_id: profile.public_id,
      },
    },
    { new: true, lean: true }
  );

  res.status(201).json({ msg: "Profile picture updated", user: updatedUser });
});

  export const getAllDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await doctorModel
    .find()
    .select("experience rating clinicLocation ")
    .populate({ path: "userId", select: "name profileImage userType" });

  res.status(200).json({ success: true, data: doctors });
});

