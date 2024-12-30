import { useEffect, useState } from "react";
import hamburgIcon from "../assets/hamburg.png";
import logo from "../assets/logo.png";
import searchButton from "../assets/magnifyingGlass.png";
import axios from "axios";
import { Link } from "react-router-dom";

function Navbar() {
  
  const accessToken = localStorage.getItem("accessToken")

  const [userData, setUserData] = useState({})
  const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })



  useEffect(() => {
    const fetchUser = async () => {
      try{
        const response = await axiosInstance.get("http://localhost:8000/api/v1/users/current-user")
        setUserData(response.data.data)
        
      }
      catch(err){
        console.error(err); 
      }
    }
    fetchUser();
  },[]);



  const [isLoggedIn, setIsLoggedIn] = useState(0)
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    if(accessToken){
      setIsLoggedIn(1)
    }else{
      setIsLoggedIn(0)
    }
  })

  console.log(userData);
  
  
  

  return (
    <div className="flex items-center justify-between px-4 py-2 mt-2 border-gray-400 shadow-md">
      {/* Left Section */}
      <div className="flex items-center space-x-4 ">
        <button>
          <img src={hamburgIcon} alt="Menu Open Button" className="h-6 sm:h-8" />
        </button>
        <div className="mr-4 sm:h-6 w-24 mb-2">
          <img src={logo} alt="YouTube logo" className="h-6 sm:h-8" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex ml-6 items-center w-full sm:w-auto mt-2 sm:mt-0 ">
        <input
          type="text"
          className="bg-[#ECEBDE] shadow-md w-[140px] sm:w-[260px] lg:w-[400px] h-10 rounded-l-full pl-4"
          placeholder="Search"
        />
        <div className="bg-[#F5EFFF] w-10 h-10 rounded-r-full flex justify-center items-center border-gray-300 border-l-2">
          <img src={searchButton} alt="Search" className="h-6" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 sm:space-x-12 sm:mr-6">
        <Link to="/publishVideo"><div className="hidden sm:flex rounded-full shadow-lg p-2 bg-[#ECEBDE]">+ Create</div></Link>
        {isLoggedIn ? (<Link to="/user"><div><img className="w-[41px] rounded-full" src={userData.avatar} alt="" /></div></Link>) : (<Link to="/sign-up"><div>Sign-Up / Sign-In</div></Link>)}
      </div>
    </div>
  );
}

export default Navbar;
