import mongoose, { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";

const publishVideo = asyncHandler(async(req, res) => {
    //upload the video on cloudinary 
    //push it to the mongodb
    const {title, description, isAnonymous} = req.body;
    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // Handle isAnonymous with default value if not provided
    const anonymousStatus = isAnonymous
    console.log(isAnonymous);
    

    //got the title and description of the video
    const videoLocalPath = req.files?.video?.[0]?.path;
    
    if(!videoLocalPath){
        throw new ApiError(400, "Video is Required");
    }
    const video = await uploadOnCloudinary(videoLocalPath);
    if(!video){
        throw new ApiError(400, "Failed to upload video on to Cloudinary")
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required");
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(400, "Failed to upload on cloudinary");
    }
    const owner = req.user?._id;
    //create a new Video
    const publishedVideo = await Video.create({
        videoFile : video.url,
        thumbnail : thumbnail.url,
        title,
        description,
        duration: video.duration,
        isPublished: true,
        views: 0,
        owner,
        isAnonymous: anonymousStatus  // Include isAnonymous field in the video creation

    })
    if(!publishedVideo){
        throw new ApiError(500, "Something went wrong while uploading the video");
    }
    return res.status(201)
    .json(new ApiResponse(200, publishedVideo, "Video uploaded Successfully"));
})
const getAllVideos = asyncHandler(async(req, res) => {
    const {page = 1, limit = 20, query, sortBy, sortType, userId} = req.query;
    const pipeline = [];
    if(query){
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        })
    }
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "user not found")
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })

    }
    pipeline.push({$match: {isPublished: true}});
    if(sortBy && sortType){
        pipeline.push({$sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }})
    }
    else{
        pipeline.push({$sort: {createdAt: -1}})
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as : "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerdetails"
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                isPublished: 1,
                ownerDetails: 1,
                isAnonymous: 1  // Include isAnonymous field in the projection
            }
        }
    )
    const videoAggregate = await Video.aggregate(pipeline);
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }
    console.log(Video.find({$isPublished: true}));
    
    try {
        const video = await Video.aggregatePaginate(videoAggregate, options)
        return res.status(200).json(new ApiResponse(200, video, "Video Fetched successfully"));
    } catch (error) {
        return res.status(500).json(500, null, "error fetched successfully")
    }
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "No videoId provided. Please include a valid videoId in the request parameters.")
    }

    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId");
    }

    const videoDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        }
                    },
                    {
                        $project: {
                            "owner.avatar.url": 1,
                            "owner.username": 1,
                            content: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$subscribers.subscriber"
                                        ]
                                    },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: "$comments",
                owner: 1,
                likesCount: 1,
                isLiked: 1,
                thumbnail: 1,
                isAnonymous: 1  // Include isAnonymous field in the projection
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoDetails, "Video Details")
    )
})
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const videoDetails = await Video.findById(videoId);

    if (videoDetails?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't delete this video as you are not the owner"
        );
    }
    
    const result = await Video.findByIdAndDelete(videoDetails?._id)
    
    if (!result) {
        throw new ApiError(500, "Couldnt Delete the Video")
    }
    
    if (videoDetails.videoFile.public_id && videoDetails.thumbnail.public_id) {
        await deleteOnCloudinary(videoDetails.videoFile.public_id, "video")
        await deleteOnCloudinary(videoDetails.thumbnail.public_id)
    }

    // Delete Video Likes and Comments

    await Like.deleteMany({
        video: videoId
    })

    await Comment.deleteMany({
        video: videoId,
    })

    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    );

    await User.updateMany(
        { "watchHistory.videoId": videoId },
        { $pull: { watchHistory: { videoId: videoId } } }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Successfully Deleted the Video")
    )

})
const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "You are not Authorized");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingVideoIndex = user.watchHistory.findIndex(
        (entry) => entry.videoId && entry.videoId.toString() === videoId
    );

    if (existingVideoIndex !== -1) {
        user.watchHistory[existingVideoIndex].watchedAt = new Date();
    } else {
        user.watchHistory.push({ videoId: new mongoose.Types.ObjectId(videoId), watchedAt: new Date() });
    }

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Video added to watch history successfully"
            )
        );
});

const incrementView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid videoId');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    video.views += 1;

    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, 'View count incremented successfully')
    );
});

const getUserUploadedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; 

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const userVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                title: 1,
                "thumbnail.url": 1,
                createdAt: 1,
                views: 1,
                isPublished: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, userVideos, "User videos fetched successfully"));
});

export {publishVideo, getVideoById, getAllVideos, deleteVideo, addToWatchHistory, incrementView, getUserUploadedVideos};