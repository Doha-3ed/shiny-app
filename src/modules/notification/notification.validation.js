import Joi from "joi"
import { generalRules } from "../../utilities/globalRules.js"


export const getNotificationSchema = {
    params:{
        notificationId:generalRules.id.required()
    },
    headers: generalRules.headers.required(),   
}

export const getBulkNotificationSchema = {
    
    headers: generalRules.headers.required(),   
}
export const getAllNotificationSchema = {

    headers: generalRules.headers.required(),   
}