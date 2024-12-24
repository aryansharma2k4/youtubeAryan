import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSusbcribedChannels
}
from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/c/:channelId")
      .get(getUserChannelSubscribers)
      .post(toggleSubscription)
router.route("/getSubscribedChannels")
      .get(getSusbcribedChannels)

export default router