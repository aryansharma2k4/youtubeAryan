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
        setLoading(false);
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
        toast.error("Uable to POST comment please try again")
      }
      

      setComments((prevComments) => [...prevComments, response.data.data]);

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex w-full">
        {/* Video Section */}
        <div className="w-[60%] p-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <video
                autoPlay
                src={videoData.videoFile}
                controls
                className="w-full"
                preload="metadata"
              ></video>
              <h2 className="mt-4 text-3xl font-semibold">{videoData.title}</h2>
              <h3 className="mt-4 text-xl font-semibold">
                {videoData.description}
              </h3>
            </>
          )}
        </div>

        {/* Comments Section */}
        <div className="w-[40%] p-4 border-l border-gray-300">
          <h1 className="text-3xl font-bold mb-4">Comments</h1>
          <div className="flex-1 overflow-y-auto h-[400px] border border-gray-300 rounded p-2">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="mb-4">
                  <div className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className="text-lg">{comment.content}</div>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>

          {/* Add Comment Box */}
          <div className="mt-4 sticky bottom-0">
            <input
              type="text"
              value={newComment}
              onChange={handleChange}
              placeholder="Add a comment..."
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleAddComment}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoPlay;
