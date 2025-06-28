import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";

export const createCommentSchema = {
        body: Joi.object({
            content: Joi.string().required(),
            refId: generalRules.id.required(),
            onModel:Joi.string()
            .valid('Post', 'comment')
            .required(),
            parentId:generalRules.id.allow(null).optional(),
            attachments: Joi.array().items(Joi.string()).optional(),
        }),
        headers: generalRules.headers.required(),
    };

export const likeCommentSchema = Joi.object({
    params: Joi.object({
        commentId: generalRules.id.required(),
       
    }),
    header: generalRules.headers.required(),
    
})