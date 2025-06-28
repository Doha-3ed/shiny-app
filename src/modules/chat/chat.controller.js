import  Router  from "express";
import { authentication } from "../../middleWare/authentication.js";
import { getAllChats, getChat } from "./chat.service.js";
import { validation } from "../../middleWare/validation.js";
import { getAllChatsSchema } from "./chat.validation.js";

const chatRouter=Router()
chatRouter.get("/getAllChats",validation(getAllChatsSchema),authentication,getAllChats)
chatRouter.get("/:userId",authentication,getChat)


export default chatRouter