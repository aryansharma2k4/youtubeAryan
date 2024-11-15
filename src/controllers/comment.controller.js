import mongoose, { isValidObjectId, Mongoose } from "mongoose";
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

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid Comment selected")
    }
    console.log(content);
    
    const comment = await Comment.findById(commentId);
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    if(!userId.equals(comment?.owner)){
        throw new ApiError(400, "You can only edit comments that are left by you")
    }
    const newComment = await Comment.findByIdAndUpdate(comment?._id, {
        $set: { content }
    }, {new: true})
    
    if(!newComment){
        throw new ApiError(400, "Unablie to update the comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment update Successfully"));

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "This is not a valid Comment Id");
    }

    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!userId.equals(comment.owner)) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});

export{
    addComment,
    updateComment,
    deleteComment
}