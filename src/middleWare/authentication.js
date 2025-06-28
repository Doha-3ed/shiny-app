import userModel from "../DB/models/user.model.js";
import { asyncHandler } from "../utilities/globalErrorHandling.js";
import { verifyToken } from "../utilities/security/index.js";

export const tokenTypes = {
    access: "access",
    refresh: "refresh",
  };
  
  export const decodedToken = async ({ authorization, tokenType } = {}) => {
    const [prefix, token] = authorization?.split(" ") || [];
    if (!prefix || !token) {
      throw new Error("Token or prefix is missing");
    }
  
    let ACCESS_SIGNATURE = undefined;
    let REFRESH_SIGNATURE = undefined;
    if (prefix.toLowerCase() === "bearer") {
      ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_admin;
      REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_admin;
    } else if (prefix.toLowerCase() === "user") {
      ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_user;
      REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_user;
    } else {
      throw new  Error("invalid prefix");
    }
  
    const decoded = await verifyToken({
      key: token,
      PRIVATE_KEY:process.env.PRIVATE_KEY,
    });
    if (!decoded?.userId) {
      throw new Error("Invalid token payload");
    }
    const user = await userModel.findById(decoded.userId).lean();
    if (!user) {
      throw new  Error("User does not exist");
    }
    if (user?.changeCredentialTime?.getTime() / 1000 > decoded.iat) {
      throw new  Error("Invalid token. Please login again");
    }
    if (user?.isDeleted) {
      throw new Error("user is deleted");
    }
    return user;
  };
  export const authentication = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodedToken({
      authorization,
      
      tokenType: tokenTypes.access,
    });
    req.user = user;
  
    next();
  });
  
  export const authorization = (accessRole = []) => {
    return (req, res, next) => {
      if (!accessRole.includes(req.user.userType)) {
        return next(new Error("access denied"));
      }
      next();
    };
  };
  export const authSocket=async({socket})=>{
    const [prefix, token] = socket?.handshake?.auth?.authorization?.split(" ") || [];
    if (!prefix || !token) {
      return {message:"Token or prefix is missing",statusCode:401};
    }
  
    let ACCESS_SIGNATURE = undefined;
    let REFRESH_SIGNATURE = undefined;
    if (prefix.toLowerCase() === "bearer") {
      ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_admin;
      REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_admin;
    } else if (prefix.toLowerCase() === "user") {
      ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_user;
      REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_user;
    } else {
      return {message:"invalid prefix",statusCode:401}
      
    }
  
    const decoded = await verifyToken({
      key: token,
      PRIVATE_KEY:process.env.PRIVATE_KEY,
    });
    if (!decoded?.userId) {
      return {message:"invalid token payload",statusCode:401};
    }
    const user = await userModel.findById(decoded.userId).lean();
    if (!user) {
      return {message:"user not exist",statusCode:401};
    }
    if (user?.changeCredentialTime?.getTime() / 1000 > decoded.iat) {
      return {message:"inavlid Token ,please login again",statusCode:401}
    }
    if (user?.isDeleted) {
      return {message:"user is deleted",statusCode:401};
    }
    return {user,statusCode:200};
  }
  