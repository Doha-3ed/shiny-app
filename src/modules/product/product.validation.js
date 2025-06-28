import Joi from "joi";

import { generalRules } from "../../utilities/globalRules.js";


export const createProductSchema = {
    body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
       
        type: Joi.string().valid("skin","hair","body").required(),
        category: Joi.string().required(),
       
       
    }),
    file: generalRules.file.optional(),
    headers: generalRules.headers.required(),
    
}

export const updateProductSchema ={
    body: Joi.object({
        title: Joi.string().optional(),
        content: Joi.string().optional(),
        price: Joi.number().optional(),
      
        type: Joi.string().optional(),
        targetType: Joi.string().optional(),
        stock: Joi.number().optional(),
        
    }),
    params: Joi.object({
        id: generalRules.id.required()
    }),
    header: generalRules.headers.required(),
    file: Joi.object({
        productPic:generalRules.file.optional()})}

export const deleteProductSchema = {
    
    params: Joi.object({
     productId: generalRules.id.required()
    }),
    headers: generalRules.headers.required()
   
}
export const getProductsSchema = {
    
  
    headers: generalRules.headers.required()
   
}

export const getProductbyIdSchema = {
    
  
    params: Joi.object({
        id: generalRules.id.required()
    }),
    headers: generalRules.headers.required()
   
}
export const searchProductSchema = {
    query: Joi.object({
        title: Joi.string().optional(),
    type: Joi.string().optional(),
    targetType: Joi.string().optional(),
    price: Joi.number().optional(),
  location:Joi.string().optional(),
    })
    
  }
export const getSpecificProductSchema = {

    params: Joi.object({
     id: generalRules.id.required()
    }),
   
}