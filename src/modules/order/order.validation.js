import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";
export const createOrderSchema = {
  body: Joi.object({
 
    address: Joi.string().required(),
    phone:Joi.string()
      .pattern(/^[+]?[0-9]{10,15}$/)
      .required(),
    pharmacyId: generalRules.id.required(),
    
  }),
  headers: generalRules.headers.required(),
}

export const getOrderSchema={
   
  headers:generalRules.headers.required()
  }