import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"



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

export {toggleVideoLike, toggleCommentLike}