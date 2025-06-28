import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import * as PV from "./pharmacy.validation.js"; 
import * as PS from "./pharmacy.service.js";
import { authentication, authorization } from "../../middleWare/authentication.js";
import { role } from "../../utilities/Enums.js";
import { PharmacyApproval } from "../adminDashboard/admin.service.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
const pharmacyRouter = Router();

pharmacyRouter.get("/searchPharmacies",validation(PV.searchPharmaciesSchema),authentication,PS.searchPharmacies)
pharmacyRouter.patch("/verifyPharmacy/:id",authentication,authorization(role.admin),PharmacyApproval)
pharmacyRouter.get("/getPharmacy/:pharmacyId",validation(PV.getPharmacySchema),PS.getPharmacyAccount)
pharmacyRouter.get("/getAllPharmacies",PS.getAllPharmacies)
pharmacyRouter.get("/getPharmacyHome",validation(PV.getPharmacyHomeSchema),authentication,PS.getPharmacyHome)
pharmacyRouter.get("/getPharmacyProfile",validation(PV.getPharmacyProfileSchema),authentication,PS.getPharmacyProfile)
pharmacyRouter.patch("/uploadPic",multerHost(fileTypes.image).single("profilePic"),validation(PV.uploadedImageSchema),authentication,PS.uploadProfile)
export default pharmacyRouter;