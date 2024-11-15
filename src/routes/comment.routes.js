import { Router } from "express";
import { addComment,updateComment, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/c/:videoId")
      .post(addComment)
router.route("/c/:commentId/updateComment")
      .post(updateComment)

router.route("/c/:commentId/deleteComment")
      .post(deleteComment)

export default router