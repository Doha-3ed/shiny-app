import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";


export const hairQuizeSchema = {
    body: Joi.object({
        answers: Joi.array()
      .items(Joi.string().valid('A', 'B', 'C', 'D', 'E'))
        ,
          
    }),
    headers: generalRules.headers.required(),
};

export const skinQuizeSchema = {
    body: Joi.object({
        answers: Joi.array()
      .items(Joi.string().valid('A', 'B', 'C', 'D', 'E'))
        ,
         
    }),
    headers: generalRules.headers.required(),

};

export const getQuizeSchema = {
    
    headers: generalRules.headers.required(),
};  