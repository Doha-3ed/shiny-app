import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { createCartSchema, getCartSchema, removeFromCartSchema, updateCartSchema } from "./cart.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { createCart, getCart, removeFromCart, UpdateCart } from "./cart.service.js";


const cartRouter = Router();
cartRouter.post("/createCart",validation(createCartSchema),authentication,createCart)
cartRouter.delete("/removeFromCart",validation(removeFromCartSchema),authentication,removeFromCart)
cartRouter.patch("/updateCart",validation(updateCartSchema),authentication,UpdateCart)
cartRouter.get("/getCart",validation(getCartSchema),authentication,getCart)
export default cartRouter;