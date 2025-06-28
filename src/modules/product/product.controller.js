import { Router } from "express";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
import { validation } from "../../middleWare/validation.js";
import * as PS from "./product.service.js";
import * as PV from "./product.validation.js";
import { authentication, authorization } from "../../middleWare/authentication.js";
import { role } from "../../utilities/Enums.js";
const productRouter = Router();
 productRouter.post("/addProduct",  multerHost(fileTypes.image).single("productPic"),validation(PV.createProductSchema),authentication,authorization(role.Pharmacist),PS.addProduct)

 productRouter.patch("/updateProduct/:id",  multerHost(fileTypes.image).single("productPic"),validation(PV.updateProductSchema),authentication,authorization(role.Pharmacist),PS.updateProduct)
 productRouter.delete("/deleteProduct/:productId",validation(PV.deleteProductSchema),authentication,authorization(role.Pharmacist),PS.deleteProduct)
productRouter.get("/getProducts",validation(PV.getProductsSchema),authentication,PS.getProducts)   
productRouter.get("/getProductsById/:id",validation(PV.getProductbyIdSchema),authentication,PS.getProductById)   
productRouter.get("/getAllProducts",validation(PV.getProductsSchema),authentication,PS.getAllProducts)
productRouter.get("/searchProducts",validation(PV.searchProductSchema),authentication,PS.searchProduct)
productRouter.get("/getProduct/:id",validation(PV.getSpecificProductSchema),PS.getSpecificProduct)   

export default productRouter;