import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";

export const createPostSchema = {
    body: Joi.object({
       content: Joi.string().required(),
       
       
    }),
    headers: generalRules.headers.required(),
    file: generalRules.file.optional()
}
export const deletePostSchema ={
   params: Joi.object({
       id: generalRules.id.required()   
   }),
    headers: generalRules.headers.required(),
    
}
export const getPostofSpecificSchema = {
    
     headers: generalRules.headers.required(),
     
 }

 export const likePostSchema = {
    params: Joi.object({
        postId: generalRules.id.required(),
       
    }),
    headers: generalRules.headers.required(),
    
}