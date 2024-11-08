import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler(async(req, res) => {
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Channel Id");
    }
    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })
    if(isSubscribed){//user is subscribed to the channel -
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed?._id);
        if(!unsubscribe){
            throw new ApiError(400, "Unable to unsubscribe ");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, "unsubscribed Successfully",{
            subscriber: req.user?._id,
            channel: channelId
        }))
    } 
    else{ //user is not subscribed to the channel and he will now subscribe the channel
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel : channelId
        })
        return res
        .status(200)
        .json(new ApiResponse(200, "Subscribed to the channel successfully", {
            subscriber: req.user?._id,
            channel: channelId
        }))

    }
})

export {toggleSubscription}