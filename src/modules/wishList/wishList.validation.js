import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";

export const createWishListSchema = {
    body: Joi.object({
        productId: generalRules.id.required(),
    }),
    header: generalRules.headers.required(),
};
export const removeWishListSchema = {
    body: Joi.object({
        productId: generalRules.id.required(),
    }),
    header: generalRules.headers.required(),
};  

export const getWishListSchema = {
    headers: generalRules.headers.required(),
};  
export const likeProductSchema = {
    params: Joi.object({
        productId: generalRules.id.required(),
    }),
    headers: generalRules.headers.required(),
}