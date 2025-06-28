import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";  
export const createAppointmentSchema = { body: Joi.object({
        userName: Joi.string().required(),
        doctorId: generalRules.id.required(),   
        date: Joi.string().required(),
        time:  Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // 24hr HH:mm format
        .required()
        .messages({
          'string.pattern.base': `"time" must be in HH:mm format`,
          'any.required': `"time" is required`
        }),
        
    }),
}

export const addAppointmentSchema={
    body: Joi.object({
        userName: Joi.string().required(),
         
        date: Joi.string().pattern(/^([1-9]|[12]\d|3[01])\/([1-9]|0[1-9]|1[0-2])\/\d{4}$/)
            .required()
            .messages({
              "string.pattern.base": "date" //must be in DD/MM/YYYY format (e.g. 9/6/2025 or 09/06/2025)
            }),
        time:  Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // 24hr HH:mm format
        .required()
        .messages({
          'string.pattern.base': "time" ,//must be in HH:mm format,
          'any.required': "time" //is required
        }),
        
    }),
    headers:generalRules.headers.required(),    
}

export const updateAppointmentSchema={
    body: Joi.object({
        userName: Joi.string().optional(),
         
        date: Joi.string().optional(),
        time:  Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // 24hr HH:mm format
        .optional()
        .messages({
          'string.pattern.base': `"time" must be in HH:mm format`,
          'any.required': `"time" is required`
        }),
        
    }),
    params:Joi.object({id:  generalRules.id.required()}),
    headers:generalRules.headers.required(),    
}
   
export const deleteAppointmentSchema ={
    
    params:Joi.object({id:  generalRules.id.required()}),
    headers:generalRules.headers.required(),    
}
   