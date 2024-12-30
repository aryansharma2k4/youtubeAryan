import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";

function Home() {
  const [videoList, setVideoList] = useState([]); // State for storing video list
  const [tokenExpired, setTokenExpired] = useState(false); // State to track token expiration
  const location = useLocation();
  const navigate = useNavigate();

  const accessToken =
    location.state?.accessToken || localStorage.getItem("accessToken");

  // Function to decode JWT and check if it's expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now(); // Compare token expiration with current time
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Treat as expired if decoding fails
    }
  };

  const axiosInstance = axios.create({
    timeout: 100000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const fetchVideos = async () => {
    try {
      const response = await axiosInstance.get(
        "http://127.0.0.1:8000/api/v1/video/"
      );
      setVideoList(response.data.data.docs); // Update state with fetched videos
    } catch (error) {
      console.error("Error fetching videos:", error);
      if (error.response?.status === 401) {
        setTokenExpired(true); // Mark token as expired if backend returns 401
      }
    }
  };

  useEffect(() => {
    if (!accessToken) {
      console.error("No access token found!");
      setTokenExpired(true); // Mark token as expired if not found
    } else if (isTokenExpired(accessToken)) {
      console.error("Access token is expired!");
      setTokenExpired(true); // Mark token as expired if it's invalid
    } else {
      fetchVideos(); // Fetch videos when component mounts
    }
  }, [accessToken]);

  if (tokenExpired) {
    return (
      <div className="flex flex-col items-center justify-center mt-16">
        <p className="text-red-500 text-lg">Session expired. Please sign in again.</p>
        <div className="mt-4">
          <Link
            to="/sign-in"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ml-16 mt-16">
        {videoList.length === 0 ? (
          <p>Loading videos...</p> /* Show loading message */
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {videoList.map((video: any, index) => (
              <div key={index} className="border rounded p-4 shadow-md">
                <Link to={`/video/${video._id}`}>
                  <img
                    className="w-[800px] h-[250px]"
                    src={video.thumbnail}
                    alt="thumbnail"
                  />
                  <div className="text-xl mt-2">{video.title}</div>
                  <div>{video.description}</div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
