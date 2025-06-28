import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { chatbotSchema, getChatbotSchema } from "./chatbot.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { addChatbotMessage, getChatbot } from "./chatbot.service.js";

const chatbotRouter = Router();

chatbotRouter.post("/addChatbotMessage",validation(chatbotSchema),authentication,addChatbotMessage)
chatbotRouter.get("/getChatbot",validation(getChatbotSchema),authentication,getChatbot)
export default chatbotRouter