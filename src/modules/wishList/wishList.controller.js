import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { createWishListSchema, getWishListSchema, likeProductSchema, removeWishListSchema } from "./wishList.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { createWishlist, getWishlist, likeProduct, removeFromWishlist } from "./wishList.service.js";


const wishListRouter = Router();

wishListRouter.post("/addToWishList", validation(createWishListSchema),authentication, createWishlist);
wishListRouter.delete("/deleteWishList", validation(removeWishListSchema),authentication, removeFromWishlist);
wishListRouter.get("/getWishList", validation(getWishListSchema),authentication,getWishlist);
wishListRouter.patch("/likeProduct/:productId", validation(likeProductSchema),  authentication, likeProduct);
export default wishListRouter;