import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
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
            <p className="text-lg">Loading videos...</p>
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
          <p className="text-center text-lg">No videos available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoList.map((video) => (
              <Link 
                key={video._id} 
                to={`/video/${video._id}`}
                className="block transition-transform hover:scale-105"
              >
                <article className="border rounded overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={video.thumbnail}
                      alt={`Thumbnail for ${video.title}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold truncate">{video.title}</h2>
                    <p className="text-gray-600 line-clamp-2 mt-1">{video.description}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Home;