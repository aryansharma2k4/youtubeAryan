import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axiosInstance from "../utils/axiosIns.tsx";

function Dashboard() {
  const [userData, setUserData] = useState<any>({}); // Updated to type 'any' for flexibility

  useEffect(() => {
    const fetchUserChannel = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:8000/api/v1/users/current-user"
        );
        setUserData(response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      console.log(userData);
      
    };
    fetchUserChannel();
  }, []);


  return (
    <>
      <Navbar />
      <div className="m-8">
        <div
          className="relative w-full h-[300px] bg-cover bg-center rounded-md"
          style={{ backgroundImage: `url(${userData.coverImage})` }}
        >
          <img
            className="absolute bottom-[-50px] left-8 w-[250px] h-[250px] rounded-full border-4 border-white shadow-lg"
            src={userData.avatar}
            alt="User Avatar"
          />
        </div>
        <div className="mt-20 mx-8 p-6 bg-white shadow-md rounded-md">
          <h1 className="text-3xl font-bold mb-4">{userData.fullName}</h1>
          <p className="text-xl text-gray-600 mb-2">
            <strong>Username:</strong> {userData.username}
          </p>
          <p className="text-xl text-gray-600 mb-2">
            <strong>Email:</strong> {userData.email}
          </p>
          <p className="text-xl text-gray-600 mb-2">
            <strong>User ID:</strong> {userData._id}
          </p>
          <p className="text-xl text-gray-600 mb-2">
            <strong>Account Created:</strong>{" "}
            {new Date(userData.createdAt).toLocaleString()}
          </p>
          <p className="text-xl text-gray-600 mb-2">
            <strong>Last Updated:</strong>{" "}
            {new Date(userData.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
