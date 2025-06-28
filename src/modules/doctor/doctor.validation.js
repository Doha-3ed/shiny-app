import Joi from "joi";
import { generalRules } from "../../utilities/globalRules.js";
import { addAvailableSlots } from "./doctor.service.js";

export const searchDoctorsSchema = {
  query: Joi.object({
    specialization: Joi.string().optional(),

    search: Joi.string().optional(),

    sortBy: Joi.string()
      .valid("createdAt", "clinicName", "specialization") // Add more fields as needed
      .optional(),

    sortOrder: Joi.string().valid("asc", "desc").optional(),
  }),
};

export const verifyDoctorsSchema = {
  params: Joi.object({
    doctorId: generalRules.id.required(),
  }),
  body: Joi.object({
    licenseNumber: Joi.string().required(),
  }),
  file: generalRules.file.optional(),
};

export const getDoctorSchema = {
  params: Joi.object({
    doctorId: generalRules.id.required(),
  }),
};
export const getDoctorIdSchema = {
  headers: generalRules.headers.required(),
};
export const addAboutSchema = {
  body: Joi.object({
    about: Joi.string().required(),
  }),

  headers: generalRules.headers.required(),
};
export const addSlotsSchema = {
  body: Joi.object({
   availableSlots: Joi.string().required()
  }),

  headers: generalRules.headers.required(),
};

export const updateDoctorSchema = {
  body: Joi.object({
    specialization: Joi.string().optional(),
    experience: Joi.string().optional(),
    licenseNumber: Joi.string().optional(),
    clinicName: Joi.string().optional(),
    clinicLocation: Joi.string().optional(),
    clinicPhone: Joi.string().optional(),
    about: Joi.string().optional(),
    availableSlots: Joi.string().optional(),
  }),

  headers: generalRules.headers.required(),
};

export const uploadPicSchema = {
  file: generalRules.file.optional(),

  headers: generalRules.headers.required(),
};
