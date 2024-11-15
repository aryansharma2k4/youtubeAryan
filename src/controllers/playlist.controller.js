// Import necessary modules and utilities
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!req.user || !req.user._id) {
        throw new ApiError(403, "You must be logged in to make a playlist");
    }

    if (title === "" || description === "") {
        throw new ApiError(400, "You must provide a title and description to continue");
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "You must provide a thumbnail to continue");
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail || !thumbnail.url) {
            throw new Error("Upload failed");
        }
    } catch (error) {
        throw new ApiError(400, "Failed to upload the thumbnail of the playlist on Cloudinary");
    }

    // Create the playlist and handle potential database errors
    let playlist;
    try {
        playlist = await Playlist.create({
            title,
            description,
            owner: req.user._id,
            thumbnail: thumbnail.url,
        });
    } catch (error) {
        throw new ApiError(500, "Unable to create a playlist");
    }

    return res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const addToPlaylist = asyncHandler(async (req, res) => {
});

export {
    createPlaylist,
    addToPlaylist, 
};
