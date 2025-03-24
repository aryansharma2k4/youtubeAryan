import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  isAnonymous?: string;
  owner?: {
    username?: string;
    fullName?: string;
    avatar?: string;
  };
}

interface ApiResponse {
  data: {
    docs: Video[];
  };
}

function Home() {
  const [videoList, setVideoList] = useState<Video[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const accessToken = useMemo(() => 
    location.state?.accessToken || localStorage.getItem("accessToken"), 
    [location.state?.accessToken]
  );

  // Improved token decoder with better error handling
  const isTokenExpired = useCallback((token: string): boolean => {
    if (!token) return true;
    
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return true;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Invalid token format:", error);
      return true;
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    if (!accessToken) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/v1/video/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authorization failed");
          return;
        }
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setVideoList(data.data.docs);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || isTokenExpired(accessToken)) {
      setError("Session expired");
      setLoading(false);
    } else {
      fetchVideos();
      console.log(videoList);
      
    }
  }, [accessToken, isTokenExpired, fetchVideos]);

  if (error && error.includes("Session expired") || error?.includes("Authorization failed") || error?.includes("No access token")) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg mb-4">{error}. Please sign in again.</p>
        <div className="flex gap-4">
          <Link
            to="/sign-in"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
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
      <main className="container mx-auto px-4 mt-16 pt-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg mt-4">Loading videos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchVideos()} 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : videoList.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"></path>
            </svg>
            <p className="text-xl mt-4">No videos available</p>
            <p className="text-gray-500 mt-2">Videos you upload will appear here</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Discover Videos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videoList.map((video) => (
                <Link 
                  key={video._id} 
                  to={`/video/${video._id}`}
                  className="block transition-transform hover:scale-105 h-full"
                >
                  <article className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover"
                        src={video.thumbnail}
                        alt={`Thumbnail for ${video.title}`}
                        loading="lazy"
                      />
                      {video.isAnonymous === "true" && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                          Anonymous
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-lg font-semibold truncate">
                        {video.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-2 mt-1 flex-grow">
                        {video.description}
                      </p>
                      
                      <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                        {video.isAnonymous === "true" ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                            </div>
                            <span className="ml-2 text-sm text-gray-500">Anonymous User</span>
                          </div>
                        ) : video.owner ? (
                          <div className="flex items-center">
                            {video.owner.avatar ? (
                              <img 
                                src={video.owner.avatar} 
                                alt={video.owner.username || "User"} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {video.owner.username ? video.owner.username.charAt(0).toUpperCase() : "U"}
                                </span>
                              </div>
                            )}
                            <span className="ml-2 text-sm text-gray-700">
                              {video.owner.fullName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown User</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Home;