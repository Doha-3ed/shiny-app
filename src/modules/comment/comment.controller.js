import { Router } from "express";
import { validation } from "../../middleWare/validation.js";
import { createCommentSchema, likeCommentSchema } from "./comment.validation.js";
import { authentication } from "../../middleWare/authentication.js";
import { createComment, likeComment } from "./comment.service.js";


const commentRouter = Router({mergeParams:true});
commentRouter.post("/", validation(createCommentSchema), authentication,    createComment);
commentRouter.patch("/likeComment/:commentId",validation(likeCommentSchema),authentication,likeComment)
export default commentRouter;