import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { addAppointmentSchema, createAppointmentSchema, deleteAppointmentSchema, updateAppointmentSchema } from "./appointment.validation.js";
import { addAppointment, createAppointment, deleteAppointment, updateAppointment } from "./appointment.service.js";
import { authentication, authorization } from "../../middleWare/authentication.js";
import { role } from "../../utilities/Enums.js";

const appointmentRouter = Router();
appointmentRouter.post("/createAppointment",validation(createAppointmentSchema),createAppointment    )
appointmentRouter.post("/addAppointment",validation(addAppointmentSchema),authentication,authorization(role.Doctor) ,createAppointment )
appointmentRouter.patch("/updateAppointment/:id",validation(updateAppointmentSchema),authentication,authorization(role.Doctor) ,updateAppointment )
appointmentRouter.delete("/deleteAppointment/:id",validation(deleteAppointmentSchema),authentication,authorization(role.Doctor) ,deleteAppointment )

export default appointmentRouter;