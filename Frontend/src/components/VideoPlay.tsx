import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import toast from "react-hot-toast";

function VideoPlay() {
  const accessToken = localStorage.getItem("accessToken");
  const { id } = useParams();

  const [videoData, setVideoData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>("");
  const [comments, setComments] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Fetch video data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `http://127.0.0.1:8000/api/v1/video/v/${id}`
        );
        setVideoData(response.data.data[0]);
        setComments(response.data.data[0].comments || []);
        setIsLiked(response.data.data[0].isLiked || false);
        setLoading(false);
        console.log(response.data.data);
        
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Prevent adding empty comments

    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8000/api/v1/comment/c/${id}/addComment`,
        {
          content: newComment,
        }
      );
      if(response.data.statusCode){
        toast.success("Comment added successfully")
      }
      else{
        toast.error("Unable to POST comment please try again")
      }
      
      setComments((prevComments) => [...prevComments, response.data.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8000/api/v1/likes/toggle/v/${id}`
      );
      setIsLiked(!isLiked);
      // Update like count if needed
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-8xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Section */}
          <div className="w-full lg:w-2/3">
            {loading ? (
              <div className="flex items-center justify-center h-96 bg-gray-200 rounded-xl animate-pulse">
                <div className="text-xl text-gray-500">Loading video...</div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative aspect-video">
                  <video
                    autoPlay
                    src={videoData.videoFile}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  ></video>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-800">{videoData.title}</h2>
                    {videoData.isAnonymous && (
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        Anonymous
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {!videoData.isAnonymous && videoData.owner?.avatar && (
                        <img 
                          src={videoData.owner.avatar} 
                          alt="Channel" 
                          className="w-12 h-12 rounded-full border-2 border-gray-200"
                        />
                      )}
                      {videoData.isAnonymous ? (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 font-bold">A</span>
                        </div>
                      ) : null}
                      <div>
                        <p className="font-medium text-gray-800">
                          {videoData.isAnonymous 
                            ? "Anonymous User" 
                            : videoData.owner?.fullName || "Channel Name"}
                        </p>
                        <p className="text-sm text-gray-500">{videoData.views || 0} views • {new Date(videoData.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full ${isLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905v.714L7.5 9h-3a2 2 0 00-2 2v.5" />
                        </svg>
                        {videoData.likesCount || 0}
                      </button>
                      
                      <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{videoData.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg h-full">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Comments</h1>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[60vh] px-6">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="py-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {comment.owner?.fullName?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-800">
                              {comment.owner?.fullName || "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>

              {/* Add Comment Box */}
              <div className="p-6 bg-gray-50 rounded-b-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    Y
                  </div>
                  <p className="text-sm font-medium text-gray-800">Add a comment</p>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={handleChange}
                    placeholder="Share your thoughts..."
                    className="w-full p-3 pr-20 border-2 border-gray-300 focus:border-blue-500 rounded-lg outline-none transition-colors"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`absolute right-2 top-2 px-4 py-1 rounded-md ${
                      newComment.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlay;