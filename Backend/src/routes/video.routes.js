import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { publishVideo, getAllVideos, getVideoById, getUserUploadedVideos, incrementView, addToWatchHistory, deleteVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.use(verifyJWT); //to apply this middleware to every routes

router.route("/publishVideo").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },{
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
)   
router
    .route("/v/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
router.route("/").get(getAllVideos)

router.route("/watchHistory/v/:videoId").post(addToWatchHistory)
router.route("/view/v/:videoId").post(incrementView)
router.route("/user/videos").get(getUserUploadedVideos)

export default router