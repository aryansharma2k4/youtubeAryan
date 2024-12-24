import { Router } from "express";
import { addToPlaylist, createPlaylist, removeVideoFromPlaylist, getUserPlaylist, deletePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)
router.route("/createPlaylist").post(createPlaylist)
router.route("/add/:videoId/:playlistId").patch(addToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/user/:userId").get(getUserPlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist)
export default router

