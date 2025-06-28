
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { generalLimiter } from "./middleWare/rateLimit.js";
import { errorHandling } from "./utilities/globalErrorHandling.js";
import connectionDb from "./DB/connectionDB.js";
import userRouter from "./modules/user/user.controller.js";
import doctorRouter from "./modules/doctor/doctor.controller.js";
import pharmacyRouter from "./modules/pharmacy/pharmacy.controller.js";
import productRouter from "./modules/product/product.controller.js";
import postRouter from "./modules/post/post.controller.js";
import cartRouter from "./modules/cart/cart.controller.js";
import orderRouter from "./modules/order/order.controller.js";
import commentRouter from "./modules/comment/comment.controller.js";
import notificationRouter from "./modules/notification/notification.controller.js";
import appointmentRouter from "./modules/appointment/appointment.controller.js";
import wishListRouter from "./modules/wishList/wishList.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";
import quizeRouter from "./modules/quize/quize.controller.js";
import { expiredOTPs } from "./utilities/CRONjobs.js";
import chatbotRouter from "./modules/chatbot/chatbot.controller.js";

const bootStrap = (express, app) => {
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.set('trust proxy', 1);
  app.use(generalLimiter);
  app.set("strict routing", true);
  app.set("case sensitive routing", true);
  
  app.use("/downloads", express.static(path.resolve("downloads")));
 
  connectionDb();
expiredOTPs()
  app.use("/user",userRouter)
  app.use("/doctor",doctorRouter)
  app.use("/pharmacy",pharmacyRouter)
  app.use("/product",productRouter)
app.use("/post",postRouter)
app.use("/cart",cartRouter)
app.use("/order",orderRouter)
app.use("/comment",commentRouter)
app.use("/notification",notificationRouter)
app.use("/appointment",appointmentRouter)
app.use("/wishList",wishListRouter)
app.use("/chat",chatRouter)
app.use("/quize",quizeRouter)
app.use("/chatbot",chatbotRouter)
  app.get("/",(req, res, next) => {
    res.status(200).json({msg:"Welcome in ShinnyApp API"})
  })
  
 /* app.use("*", (req, res, next) => {
    return next(new Error("invalid URL"));
  });*/
  app.use(errorHandling);
};
export default bootStrap;