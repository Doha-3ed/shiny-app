import Joi from "joi"
import { generalRules } from "../../utilities/globalRules.js";


export const getAllChatsSchema = {

    headers: generalRules.headers.required(),
};

