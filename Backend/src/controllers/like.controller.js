import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import { application } from "express";



const toggleVideoLike = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    if(!req.user?._id){
        throw new ApiError(403, "You must be authenticated to leave a like on the video")
    }
    const userId = req.user?._id;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Please provide a correct video link")
    }
    const liked = await Like.findOne({
        video: videoId,
        likedBy: userId
    })
    if(liked){
        await Like.findByIdAndDelete(liked?._id)
        return res.status(200).json(200, "dislike the video successfully")
    }
    await Like.create({
        video: videoId,
        likedBy: userId
    })
    return res.status(200).json(200, "Liked the video successfully")

})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const {commentId} = req.params;

    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(400, "You are not authorized to like the comment");
    }
    const liked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    if(liked){ //comment already liked
        await Like.findByIdAndDelete(liked?._id);
        return res.status(200).json(200, "Comment Liked removed")
    }
    await Like.create({
        comment: commentId,
        likedBy: userId
    })
    return res.status(200).json(200, "Comment Liked successfully")

})

const getLikedVideos = asyncHandler(async(req, res) => {
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(404, "No user Id fetched from the server")
    }
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails",
                    },
                    {
                        $project: {
                            _id: 1,
                            "videoFile.url": 1,
                            "thumbnail.url": 1,
                            owner: 1,
                            title: 1,
                            description: 1,
                            views: 1,
                            duration: 1,
                            createdAt: 1,
                            isPublished: 1,
                            ownerDetails: {
                                username: 1,
                                fullName: 1,
                                "avatar.url": 1,
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $replaceRoot: { newRoot: "$likedVideo" },
        },
    ]);
    if(!likedVideos){
        throw new ApiError(400, "No liked videos found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "liked video fetched successfully"
            )
        )
})

export {toggleVideoLike, toggleCommentLike, getLikedVideos}