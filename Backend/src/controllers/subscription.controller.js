import mongoose, { isValidObjectId, mongo } from "mongoose";
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

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid Channel ID')
    }

    const getSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",


                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$subscriber",
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, getSubscribers, "Fetched channel subscribers successfully")
    )
})

const getSusbcribedChannels = asyncHandler(async(req, res) => {
    const subscriberId = req.user?._id;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(403, "Not authenticated to access the subscribed channels");
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from : "users",
                localField : "channel",
                foreignField: "_id",
                as : "channelDetails",
            },
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $lookup: {
                from : "users",
                localField: "channelDetails._id",
                foreignField: "channel",
                as: "subscribers"
            },
        },
        {
            $project: {
                _id: "$channelDetails._id",
                fullName: "$channelDetails.fullName",
                username: "channelDetails.username",
                AvatarUrl: "$channelDetails.avatar.url",
                subscribersCount: { $size: "$subscribers"}
            }
        }
    ])
    if(!subscribedChannels){
        throw new ApiError(404, "Couldn't fetch subscribed channels");
    }
    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Successfully fetched subscribed channels")
    )
})

export {toggleSubscription, getUserChannelSubscribers, getSusbcribedChannels}