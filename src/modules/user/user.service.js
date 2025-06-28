import userModel from "../../DB/models/user.model.js";
import cloudinary from "../../utilities/cloudnairy/index.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import { compare, decrypt, encrypt, hash } from "../../utilities/security/index.js";
import wishListModel from "../../DB/models/wishList.model.js";
export const updateAccount = asyncHandler(async (req, res, next) => {
    if (req.body.phoneNumber) {
      req.body.phoneNumber = await encrypt({
        key: req.body.phoneNumber,
        SECRETE_KEY: process.env.SECRETE_KEY,
      });
    }
  
    const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      lean: true,
    });
  
    if (!user) {
      return next(new Error("User not found"));
    }
  
    res.status(201).json({ msg: "done", user });
  });
  //--------------------------------------------------------getAccount--------------------------------------------------------------------------------
export const getAccount = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id).select("name phoneNumber profileImage skinType hairType");
    if (user.phoneNumber){
      user.phoneNumber =  decrypt(  user.phoneNumber,
                                   process.env.SECRETE_KEY,)
    }
  
  
    if (!user) {
      return next(new Error("User not found"));
    }
  const wishList=await wishListModel.find({userId:req.user._id}).populate({ path: 'products', select: 'title price image likes type' })
    if (!wishList){
      return next(new Error("wishList not found"));
    }
    
    res.status(201).json({ msg: "done",success: true, user, wishList});
  });
  //--------------------------------------------------------getAnotherUser--------------------------------------------------------------------------------
export const getAnotherUser = asyncHandler(async (req, res, next) => {
    const user = await userModel
      .findById(req.body.userId)
      .select("name phoneNumber profileImage");
  
    if (!user) {
      return next(new Error("User not found"));
    }
    if (user.phoneNumber) {
      user.phoneNumber = await decrypt({
        key: user.phoneNumber,
        SECRETE_KEY: process.env.SECRETE_KEY,
      });
    }
  
    res.status(201).json({ msg: "done", user });
  });
  //--------------------------------------------------------updatePassword--------------------------------------------------------------------------------
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPass, newPass } = req.body;

  const isMatch = await compare({
    key: oldPass,
    HashedKey: req.user.password,
  });
  if (!isMatch) {
    return next(new Error("invalid password"));
  }
  const hashed = await hash({ key: newPass ,SALT_ROUND:process.env.SALT_ROUND});

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: hashed, changeCredentialTime: Math.floor(Date.now() / 1000) },
    { new: true, lean: true }
  );

  res.status(201).json({ msg: "done", user });
});
//--------------------------------------------------------uploadProfile--------------------------------------------------------------------------------
export const uploadProfile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }
  const profile = await cloudinary.uploader.upload(req.file.path);

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: {
        secure_url: profile.secure_url,
        public_id: profile.public_id,
      },
    },
    { new: true, lean: true }
  );

  res.status(201).json({ msg: "Profile picture updated", user });
});
//--------------------------------------------------------deleteProfileImage--------------------------------------------------------------------------------
export const deleteProfileImage = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id);
    if (!user?.profileImage) {
      return next(new Error("No profile picture found"));
    }
    await cloudinary.uploader.destroy(user.profileImage.public_id);
    user.profileImage = { secure_url: "", public_id: "" };
    await user.save();
  
    res.status(201).json({ msg: "profile picture deleted" });
  });
  //--------------------------------------------------------softDelete--------------------------------------------------------------------------------
export const softDelete = asyncHandler(async (req, res, next) => {
    const user = await userModel.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      return next(new Error("user not Found"));
    }
  
    await userModel.findOneAndUpdate(
      { _id: user._id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  
    res.status(201).json({ msg: "softDelete is Done" });
  })
  //------------------------------------------------------------chooseHairSkinType-------------------------------------------------------
  export const chooseHairType = asyncHandler(async (req, res, next) => {
    
    const { hairType,userId } = req.body;

    if (!hairType) {
    return res.status(200).json({ msg: "Hair type not selected — skipped" });
  }
  
    const user = await userModel.findOneAndUpdate(
      { _id:userId, isDeleted: false },
      { hairType },
      { new: true, lean: true }
    );
  
    if (!user) {
      return next(new Error("user not Found"));
    }
  
    res.status(201).json({ msg: "done", user });
  });

  export const chooseSkinType = asyncHandler(async (req, res, next) => {
    const { skinType,userId } = req.body;

     if (!skinType) {
    return res.status(200).json({ msg: "skin type not selected — skipped" });
  }
    const user = await userModel.findOneAndUpdate(
      { _id:userId, isDeleted: false },
      { skinType },
      { new: true, lean: true }
    );
  
    if (!user) {
      return next(new Error("user not Found"));
    }
  
    res.status(201).json({ msg: "done", user });
  });

  