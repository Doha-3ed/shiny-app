import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";

export const chatbotSchema = {
    body: Joi.object({
        message: Joi.string().required(),
    }),
    headers:generalRules.headers.required()
};

export const getChatbotSchema = {
   
    headers:generalRules.headers.required()
};