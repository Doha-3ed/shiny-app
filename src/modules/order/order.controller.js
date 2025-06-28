import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { createOrderSchema, getOrderSchema } from "./order.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { createOrder, getAllOrders, getAvailablePharmacies } from "./order.service.js";


 const orderRouter = Router();
 orderRouter.get("/getAvailablePharmacies",validation(getOrderSchema),authentication, getAvailablePharmacies);
orderRouter.post("/createOrder",validation(createOrderSchema), authentication,createOrder)
orderRouter.get("/getAllOrders",authentication,getAllOrders)
 export default orderRouter;