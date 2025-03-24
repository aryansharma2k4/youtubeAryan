import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axiosInstance from "../utils/axiosIns.tsx";

function Dashboard() {
  const [userData, setUserData] = useState<any | null>(null); // State to store user data
  const [isLoading, setIsLoading] = useState(true); // State to handle loading spinner

  useEffect(() => {
    const fetchUserChannel = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:8000/api/v1/users/current-user"
        );
        setUserData(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false); // Stop loading after data fetch attempt
      }
    };
    fetchUserChannel();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-700 p-8 flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white"></div>
          </div>
        ) : userData ? (
          <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-2xl">
            <h1 className="text-2xl font-bold text-indigo-800 text-center mb-4">
              Welcome, {userData.fullName}!
            </h1>
            <p className="text-gray-500 text-center mb-6">
              Here are your account details:
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium w-32 text-indigo-600">Username:</span>
                <span>{userData.username}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32 text-indigo-600">Email:</span>
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32 text-indigo-600">User ID:</span>
                <span>{userData._id}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32 text-indigo-600">
                  Account Created:
                </span>
                <span>{new Date(userData.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-32 text-indigo-600">
                  Last Updated:
                </span>
                <span>{new Date(userData.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white">No user data found.</p>
        )}
      </div>
    </>
  );
}

export default Dashboard;
