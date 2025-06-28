import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";

export const createCartSchema = {
 body: Joi.object({
    productId: generalRules.id.required(),
    quantity:Joi.number().required()
  }).required(),
  headers: generalRules.headers.required(),
};

 //----------------------------------------------------------removeFromCartSchema----------------------------------------------------------------------------
export const removeFromCartSchema = {
  body: Joi.object({
    productId: generalRules.id.optional(),
  }),
  headers: generalRules.headers.required(),
}

//----------------------------------------------------------updateCartSchema----------------------------------------------------------------------------
export const updateCartSchema = {
    body: Joi.object({
       productId: generalRules.id.optional(),
       quantity:Joi.number().optional()
     }).optional(),
     headers: generalRules.headers.required(),
   };
//----------------------------------------------------------getCartSchema----------------------------------------------------------------------------
export const getCartSchema = {
    headers: generalRules.headers.required(),
  };