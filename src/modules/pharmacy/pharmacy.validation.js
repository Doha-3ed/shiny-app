
import Joi from"joi";
import { generalRules } from "../../utilities/globalRules.js";

export const searchPharmaciesSchema = {
  query: Joi.object({
    search: Joi.string().optional(),
  city: Joi.string().optional(),
  medicine: Joi.string().optional(),
  sortBy: Joi.string()
    .valid("createdAt", "name", "location")
    .default("createdAt"),
  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
  })

    
  }
  export const getPharmacySchema = {
params: Joi.object({
    pharmacyId: generalRules.id.required()
}),
    headers: generalRules.headers.required(),
  }
  export const getPharmacyHomeSchema = {

    headers: generalRules.headers.required(),
  }
  export const getPharmacyProfileSchema = {

    headers: generalRules.headers.required(),
  }
export const uploadedImageSchema = {
file: generalRules.file.optional(), 
    headers: generalRules.headers.required(),
  }
