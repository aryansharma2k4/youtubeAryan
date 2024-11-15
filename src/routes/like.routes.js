import { Router } from "express";
import { toggleVideoLike, toggleCommentLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/c/:videoId/toggleVideoLike")
      .post(toggleVideoLike)

router.route("/c/:videoId/toggleCommentLike")
      .post(toggleCommentLike)

export default router

