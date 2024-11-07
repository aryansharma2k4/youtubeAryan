import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, updateAccountDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router .route("/login").post(loginUser)

//securedRoutes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/updateDetails").post(updateAccountDetails)

export default router