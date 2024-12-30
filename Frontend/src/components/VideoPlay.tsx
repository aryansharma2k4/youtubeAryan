import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

function VideoPlay() {
  const accessToken = localStorage.getItem("accessToken");
  const { id } = useParams();

  const [videoData, setVideoData] = useState<any>({}); // Changed to setVideoData
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Use useEffect to handle the async request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `http://127.0.0.1:8000/api/v1/video/v/${id}`
        );
        setVideoData(response.data.data[0]);
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error(err);
        setLoading(false); // Ensure loading is set to false even on error
      }
    };

    fetchData();
  }, [id, accessToken]);

  const commentList = videoData.comments || [];
  console.log(commentList[0]);
  

  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="mt-4 ml-4">
          {loading ? (
            <p>Loading...</p> // Show loading message
          ) : (
            <>
              <video
                autoPlay
                src={videoData.videoFile}
                controls
                className="w-[800px] h-[600px]"
                preload="metadata"
              ></video>
              <h2 className="mt-4 text-3xl font-semibold">{videoData.title}</h2>
              <h3 className="mt-4 text-xl font-semibold">
                {videoData.description}
              </h3>
            </>
          )}
        </div>
        <div className="mt-4 ml-12">
          <h1 className="text-3xl font-bold">Comments</h1>
          {commentList.length > 0 ? (
            commentList.map((comment: any, index: number) => (
              <div key={index}>
                <div className="mt-4">{new Date(comment.createdAt).toLocaleString()}</div> {/* Convert to readable format */}
                <div className="text-xl">{comment.content}</div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default VideoPlay;
