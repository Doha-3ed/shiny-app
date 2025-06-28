import Router from "express";
import { validation } from "../../middleWare/validation.js";
import * as UV from "./user.validation.js";
import * as UA from "../Auth.js";
import * as US from "./user.service.js";
import { authentication, authorization } from "../../middleWare/authentication.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
import { role } from "../../utilities/Enums.js";
import { banUser } from "../adminDashboard/admin.service.js";
const userRouter = Router();

userRouter.post("/signUP",multerHost(fileTypes.image).single("certificate"),UV.validateSignup,UA.SignUp)
userRouter.post("/confirmEmail",validation(UV.confirmEmailSchema),UA.confirmEmail)
userRouter.post("/login", validation(UV.loginSchema), UA.signIn);

userRouter.post(
  "/loginWithGmail",
 validation(UA.logInWithGoogle),
  UA.logInWithGoogle
);
userRouter.patch(
    "/forgetPassword",
    validation(UV.forgetPasswordSchema),
    UA.forgetPassword
  );
  userRouter.patch(
    "/confirmPassword",
    validation(UV.confirmPasswordSchema),
    UA.confirmForgetPasswordOTP
  );
  userRouter.patch(
    "/resetPassword",
    validation(UV.resetPasswordSchema),
    UA.resetPasswordAfterVerification
  );
  userRouter.get("/getAccount", validation(UV.getAccountSchema), authentication, US.getAccount);
  userRouter.patch(
    "/uploadProfilePic",
    multerHost(fileTypes.image).single("profilePic"),
    validation(UV.uploadProfilePicSchema),
    authentication,
    US.uploadProfile
  );
  userRouter.delete("/deleteProfilePic", validation(UV.deletePicSchema), authentication, US.deleteProfileImage);
  userRouter.patch("/softDelete", validation(UV.softDeleteSchema), authentication, US.softDelete);
  userRouter.patch(
    "/banOrUnbann/:userId",
    authentication,
    authorization(role.admin),
    banUser
  );
  userRouter.patch("/chooseHairType",validation(UV.chooseHairTypeSchema),US.chooseHairType)  
   userRouter.patch("/chooseSkinType",validation(UV.chooseSkinTypeSchema),US.chooseSkinType) 
export default userRouter;
