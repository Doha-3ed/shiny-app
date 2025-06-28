import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { getQuizeSchema, hairQuizeSchema, skinQuizeSchema } from "./quize.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { addhairQuize, addskinQuize, getHairQuizResult, getSkinQuizResult } from "./quize.service.js";
 const quizeRouter=Router()

quizeRouter.post("/hairQuize",validation(hairQuizeSchema),authentication,addhairQuize)
quizeRouter.post("/skinQuize",validation(skinQuizeSchema),authentication,addskinQuize)
quizeRouter.get("/getHairQuize",validation(getQuizeSchema),authentication,getHairQuizResult)
quizeRouter.get("/getSkinQuize",validation(getQuizeSchema),authentication,getSkinQuizResult)
 export default quizeRouter