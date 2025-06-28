import joi from "joi";

import mongoose from "mongoose";

const idValidation = (value, helper) => {
  const isValidId = mongoose.Types.ObjectId.isValid(value);
  return isValidId ? value : helper.message(`Invalid Id:${value}`);
};

export const generalRules = {
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  id: joi.string().custom(idValidation),
  headers: joi.object({
    authorization: joi.string(),
    "cache-control": joi.string(),
    "postman-token": joi.string(),
    "content-type": joi.string(),
    "content-length": joi.string(),
    host: joi.string(),
    "user-agent": joi.string(),
    accept: joi.string(),
    "accept-encoding": joi.string(),
    connection: joi.string(),
  }).unknown(true),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
};
