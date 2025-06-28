import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import * as DV from "./doctor.validation.js";
import * as DS from "./doctor.service.js";
import {
    authentication,
    authorization,
} from "../../middleWare/authentication.js";
import { verifyDoctor } from "../adminDashboard/admin.service.js";
import { role } from "../../utilities/Enums.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";

const doctorRouter = Router();


doctorRouter.patch(
    "/verifyDoctor/:doctorId",
    validation(DV.verifyDoctorsSchema),
    authentication,
    authorization(role.admin),
    verifyDoctor,
);
doctorRouter.get(
    "/getDoctor/:doctorId",
    validation(DV.getDoctorSchema),
    DS.getDoctorWithPosts,
);
doctorRouter.get(
    "/getDoctorId",
    validation(DV.getDoctorIdSchema),
    authentication,
    DS.getDoctorById,
);
doctorRouter.patch(
    "/updatedoctor",
    validation(DV.updateDoctorSchema),
    authentication,
    DS.updateDoctor,
);
doctorRouter.patch(
    "/uploadProfilePic",
    multerHost(fileTypes.image).single("profilePic"),
    validation(DV.uploadPicSchema),
    authentication,
    DS.uploadProfile,
);
doctorRouter.get(
    "/addBio",
    validation(DV.addAboutSchema),
    authentication,
    DS.addAbout,
);
doctorRouter.post(
    "/addSlots",
    validation(DV.addSlotsSchema),
    authentication,
    DS.addAvailableSlots,
);
doctorRouter.get("/getAllDoctors", DS.getAllDoctors);
export default doctorRouter;
