import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async(req, res) => {
    //get all the comments for the video
    const {videoId} = req.params;
    

})

const addComment = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;
    console.log(req.params);
    
    console.log(req.body);
    
    if(!content || content?.trim() === ""){
        throw new ApiError(400, "Comment cannot be left empty")
    }
    const comment = await Comment.create({
        video: videoId,
        content,
        owner: req.user?._id
    })
    if(!comment){
        throw new ApiError(500, "Comment cannot be added");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, {
        "_id": comment._id,
        content: comment.content,
        owner: comment.owner
    }, "Comment added successfully"))

})

export{
    addComment
}