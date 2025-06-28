import { Router } from "express";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
import { validation } from "../../middleWare/validation.js";
import { createPost, deletePost, forSpecificDoctor, getAllPosts, likePost } from "./post.service.js";
import { createPostSchema, deletePostSchema, getPostofSpecificSchema, likePostSchema } from "./post.validation.js";
import { authentication, authorization } from "../../middleWare/authentication.js";
import { role } from "../../utilities/Enums.js";
import commentRouter from "../comment/comment.controller.js";
 const postRouter = Router();

postRouter.post("/createPost",multerHost(fileTypes.image).fields([{name:"attachments",maxCount:3},{name:"attachment",maxCount:0}]),validation(createPostSchema),authentication,authorization(role.Doctor),createPost)    

postRouter.delete("/deletePost/:id",validation(deletePostSchema),authentication,authorization(role.Doctor),deletePost)
postRouter.get("/getPostofSpecific",validation(getPostofSpecificSchema),authentication,forSpecificDoctor)
postRouter.get("/getAllPosts",getAllPosts)
postRouter.patch("/likeOrDislike/:postId",validation(likePostSchema),authentication,likePost)
postRouter.use("/:refId/comments", commentRouter)
 export default postRouter;