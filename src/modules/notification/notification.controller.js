import { Router } from "express";
import { validation } from "../../middleWare/validation.js";

import { getBulkNotificationSchema, getNotificationSchema,getAllNotificationSchema } from "./notification.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { markAllAsRead, markAsRead ,getNotifications} from "./notification.service.js";

const notificationRouter = Router();    

notificationRouter.patch("/markAsRead/:notificationId",validation(getNotificationSchema),authentication,markAsRead)
notificationRouter.patch("/markAllAsRead",validation(getBulkNotificationSchema),authentication,markAllAsRead)   
notificationRouter.get("/getNotification",validation(getAllNotificationSchema),authentication,getNotifications)
export default notificationRouter;