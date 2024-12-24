// Import necessary modules and utilities
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Playlist } from "../models/playlist.model.js";
import {Video} from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!req.user || !req.user._id) {
        throw new ApiError(403, "You must be logged in to make a playlist");
    }
    console.log(title);
    console.log(description);
    
    

    if (!title || !description) {
        throw new ApiError(400, "You must provide a title and description to continue");
    }

    let playlist;
    try {
        playlist = await Playlist.create({
            title,
            description,
            owner: req.user._id,
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        throw new ApiError(500, "Unable to create a playlist");
    }

    return res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const deletePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist not found");
    }
    const playlistDetails = await Playlist.findById(playlistId);
    if(!playlistDetails){
        throw new ApiError(400, "No such playlist found");
    }
    const userId = mongoose.Types.ObjectId(req.user?._id);
    if(!userId.equals(playlistDetails?.owner)){
        throw new ApiError(403, "You are not authenticated to delete this playlist");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistDetails?._id);
    if(!deletedPlaylist){
        throw new ApiError(400, "Unable to delete playlist");
    }
    return res.status(200).json(200, deletedPlaylist, "Playlist deleted successfully");
})

const getUserPlaylist = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(403, "You are not allowed to access the playlist")
    }
    
    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                }
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                totalVideos: 1,
                createdAt: 1,
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, playlist, "User playlist fetched"))
})



const addToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    if(!req.user?._id){
        throw new ApiError(403, "You are not authenticated to add this video to this playlist");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist id");
    }
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if((Playlist.owner?.toString() && Video.owner?.toString() !== req.user?._id.toString())){
        throw new ApiError(403, "You are not authenticated to add video to this playlist");
    }
    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(playlist?._id, {
        $addToSet: {
            videos: videoId
        }
    },{new: true});
    if(!addToPlaylist){
        throw new ApiError(400, "Error adding video to the playlist");
    }
    return res.status(200).json(new ApiResponse(200, addVideoToPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Wrong playlist id provided");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Wrong video id provided");
    }
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if(!playlist){
        throw new ApiError(400, "Unable to find this playlist");
    }
    if(!video){
        throw new ApiError(400, "Unable to find this video");
    }
    if(playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authenticated to add video to this playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: videoId,
        },

    },{new: true})
    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Updated the playlist successfully"));
})

export {
    createPlaylist,
    addToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylist,
    deletePlaylist
};
