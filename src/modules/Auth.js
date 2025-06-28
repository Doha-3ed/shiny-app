import { OAuth2Client } from "google-auth-library";
import userModel from "../DB/models/user.model.js";
import { hairType, OTPtypes, provider, role, skinType } from "../utilities/Enums.js";
import { asyncHandler } from "../utilities/globalErrorHandling.js";
import { compare, generateToken, hash } from "../utilities/security/index.js";
import { eventemit } from "../utilities/sendEmail.event.js";
import { decodedToken } from "../middleWare/authentication.js";
import doctorModel from "../DB/models/doctor.model.js";

import cloudinary from "../utilities/cloudnairy/index.js";
import PharmacyModel from "../DB/models/pharmacy.model.js";

export const SignUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, phoneNumber, userType, ...additionalData } = req.body;
  
    const emailExist = await userModel.findOne({ email });
    if (emailExist) {
      return next(new Error("Email already exists"));
    }
  
   
  
    try {
      let user;
      const baseUserData = {
        name,
        email,
        password,
        phoneNumber,
        userType,
        isConfirmed: false,
        provider: provider.system
      };
  if (userType === role.User) {
        baseUserData.hairType =null;  // Store hair type, default is null if not provided
        baseUserData.skinType =  null;  // Store skin type, default is null if not provided
      }
      // Create user based on type
      switch (userType) {
        case role.User:
          case role.admin:
          user = await userModel.create(baseUserData);
          break;
  
        case role.Doctor:
          if (req.file) {
           const certificate = await cloudinary.uploader.upload(req.file.path);
           user = await userModel.create(baseUserData);
          await doctorModel.create({
            userId: user._id,
            specialization: additionalData.specialization,
            licenseNumber: additionalData.licenseNumber,
            clinicName: additionalData.clinicName,
            clinicPhone: additionalData.clinicPhone || phoneNumber,
            clinicLocation: additionalData.clinicLocation,
            experience:additionalData.experience,
            certification: {
              url: certificate.secure_url,
              public_id: certificate.public_id,
            },
            // Add other doctor-specific fields
          });
          }else{
            user = await userModel.create(baseUserData);
            await doctorModel.create({
              userId: user._id,
              specialization: additionalData.specialization,
              licenseNumber: additionalData.licenseNumber,
              clinicName: additionalData.clinicName,
              clinicPhone: additionalData.clinicPhone || phoneNumber,
              clinicLocation: additionalData.clinicLocation,
              experience:additionalData.experience,
              
              // Add other doctor-specific fields
            });
          }
          
        
          
          break;
  
        case role.Pharmacist:
         
          
          user = await userModel.create(baseUserData);
          await PharmacyModel.create({
            userId: user._id,
            location: additionalData.location,
            licenseNumber: additionalData.licenseNumber,
            isApproved: false 
          });
          break;
  
        default:
          return next(new Error("Invalid user type"));
      }
  
      // Send confirmation email
      eventemit.emit("sendEmail", { 
        email,
        userId: user._id,
        userType 
      });
  
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
  
      res.status(201).json({ 
        success: true,
        message: "Signup successful. Please check your email to confirm your account.",
        data: userResponse
      });
  
    } catch (error) {
      // Handle duplicate phone numbers or other errors
     
      next(error);
    }
  });
  //-----------------------------------------------------------------confirmEmail--------------------------------------------------------------------
export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;
    const userExist = await userModel.findOne({ email, isConfirmed: false });
    if (!userExist) {
      return next(new Error("User not found"));
    }
    const otp = userExist.OTP.find(
      (otpType) =>
        otpType.type === OTPtypes.confirmEmail && otpType.expiresIn > new Date()
    );
    if (!otp) {
      return next(new Error("invalid OTP"));
    }
    const isMatch = await compare({ key: code, HashedKey: otp.code });
    if (!isMatch) {
      return next(new Error("code is not Correct"));
    }
    const user = await userModel.findOneAndUpdate(
      { email },
      { isConfirmed: true, $push: { OTP: { type: OTPtypes.confirmEmail } } },
      { new: true }
    );
    res.status(201).json({ 
      msg: "done", 
      success: true, // ✅ أضف هذا السطر
      user 
    });
  });
  //-----------------------------------------------------------------SignIn--------------------------------------------------------------------
export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const userExist = await userModel.findOne({
      email,
      provider: provider.system,
      isConfirmed: true,
    });
    
    if (!userExist) {
      return next(new Error("User not found"));
    }
    const checkPass = await compare({
      key: password,
      HashedKey: userExist.password,
    });
    if (!checkPass) {
      return next(new Error("password not match"));
    }
    if (userExist.isDeleted) {
    userExist.isDeleted = false;
    userExist.deletedAt = null;
    await userExist.save();
  }

    const refreshToken = await generateToken({
      payload: { email, userId: userExist._id },
      PRIVATE_KEY:
        userExist.userType == role.User ?
          process.env.SIGNATURE_user
        : process.env.SIGNATURE_admin,
      expired: "7d",
    });
    const accessToken = await generateToken({
      payload: { email, userId: userExist._id },
      PRIVATE_KEY:
        userExist.userType == role.User ?
          process.env.SIGNATURE_user
        : process.env.SIGNATURE_admin,
      expired: "1h",
    });
  
    res.status(200).json({
      msg: "You logged in successfully",
      success: true,
      Token: {
        accessToken,
        refreshToken,
      },
      user: {
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        userType: userExist.userType,
       
      },
    });
  });
  
  //-----------------------------------------------------------------logInWithGoogle--------------------------------------------------------------------
const client = new OAuth2Client();

export const logInWithGoogle = asyncHandler(async (req, res, next) => {
  const { idToken,userType } = req.body;

  if (!idToken) {
    return next(new Error('ID token is required'));
  }

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '195197956961-n2r77blsntf3t13natu5lla03kom7d0q.apps.googleusercontent.com', // تم التحديث
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const { email, email_verified, name, picture } = await verify();

  let user = await userModel.findOne({ email });

  if (!user) {
    // مستخدم جديد: أنشئه واطلب منه يكمل بياناته
    user = await userModel.create({
      name,
      email,
      userType,
      isConfirmed: email_verified,
      profileImage: picture,
      provider: provider.google,
      
    });
  }
   /* return res.status(201).json({
      msg: "Please complete your profile",
      needAdditionalInfo: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isProfileComplete: false
      }
    });
  }
*/
  if (user.provider !== provider.google) {
    return next(new Error('Please login using the system method you registered with'));
  }

 /* if (!user.isProfileComplete || !user.userType) {
    return res.status(200).json({
      msg: "Please complete your profile",
      needAdditionalInfo: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isProfileComplete: false
      }
    });
  }*/

  // تسجيل دخول طبيعي بعد التأكد من اكتمال البيانات
  const accessToken = await generateToken({
    payload: { email, userId: user._id },
    PRIVATE_KEY:
      user.userType == role.User
        ? process.env.SIGNATURE_user
        : process.env.SIGNATURE_admin,
    expired: '1h',
  });

  res.status(200).json({
    msg: 'You logged in successfully',
    success: true,
    Token: {
      accessToken,
    },
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
    },
  });
});
  //-----------------------------------------------------------------forgetPassword--------------------------------------------------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email, isDeleted: false });
  
    if (!user) {
      return next(new Error("user not found ,try again "));
    }
    eventemit.emit("forgetPassword", { email });
  
    res.status(200).json({ msg: "done" });
  });
  //-----------------------------------------------------------------resetPassword--------------------------------------------------------------------
  
  //-----------------------------------------------------------------refreshToken--------------------------------------------------------------------
  export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodedToken({
      authorization,
      tokenType: tokenTypes.access,
    });
    const accessToken = await generateToken({
      payload: { email: user.email, userId: user._id },
      PRIVATE_KEY:
        user.userType == role.User ?
          process.env.SIGNATURE_user
        : process.env.SIGNATURE_admin,
      expired: "1h",
    });
  
    res.status(201).json({
      msg: "token is refreshed",
      Token: {
        accessToken,
      },
    });
  });
  

  export const confirmForgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
    const userExist = await userModel.findOne({ email, isConfirmed: true });
    if (!userExist) {
      return next(new Error("User not found"));
    }
    const otp = userExist.OTP.find(
      (otpType) =>
        otpType.type === OTPtypes.forgetPassword && otpType.expiresIn > new Date()
    );
    if (!otp) {
      return next(new Error("invalid OTP"));
    }
    const isMatch = await compare({ key: code, HashedKey: otp.code });
    if (!isMatch) {
      return next(new Error("code is not Correct"));
    }
     await userModel.findOneAndUpdate(
      { email },
      { $push: { OTP: { type: OTPtypes.forgetPassword } } },
      { new: true }
    );
    res.status(201).json({ 
      msg: "confirmmmmmmed", 
      success: true, // ✅ أضف هذا السطر
      
    });
});

export const resetPasswordAfterVerification = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;

  const user = await userModel.findOne({ email, isDeleted: false });
  if (!user) {
    return next(new Error("User not found"));
  }

 

  const hashedPassword = await hash({
    key: newPassword,
    SALT_ROUND: process.env.SALT_ROUND,
  });
  await userModel.findOneAndUpdate(
    { email },
    {
      
      password:hashedPassword,changeCredentialTime: Math.floor(Date.now() / 1000)
    },
    { new: true }
  );
  
  

  res.status(200).json({ msg: "password reset successfully" });
});
