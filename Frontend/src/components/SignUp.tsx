import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast"

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: File | null;
  coverImage: File | null;
}

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    avatar: null,
    coverImage: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle text inputs
    if (name === "firstName" || name === "lastName" || name === "email" || name === "password") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    // Handle file inputs
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      
    const form = new FormData();
    form.append("fullName", formData.firstName);
    form.append("email", formData.email);
    form.append("username", formData.email);
    form.append("password", formData.password);
  
    if (formData.avatar) form.append("avatar", formData.avatar);
    if (formData.coverImage) form.append("coverImage", formData.coverImage);
  
    const axiosInstance = axios.create({
      timeout: 50000,
    });
  
    try {
      const response = await axiosInstance.post(
        "http://127.0.0.1:8000/api/v1/users/register",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data && response.data.data.accessToken) {
        const { accessToken } = response.data.data;
  
        // Save the token in localStorage or any state management system
        localStorage.setItem("accessToken", accessToken);
  
        toast.success("Account created successfully");
  
        // Redirect to the homepage
        navigate("/", { state: { accessToken } });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  

  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="h-12 mr-2" src={logo} alt="logo" />
        </a>
        <div className="w-full bg-[#ECEBDE] rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign Up for Youtube
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">First Name</label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Last Name</label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Avatar Image</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Cover Image</label>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleFileChange}
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-gray-900"
              >
                Sign Up
              </button>
              <p className="text-sm font-light text-center text-gray-900">
                Already Registered?{" "}
                <NavLink to="/sign-in">
                  <a className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-gray-900">
                    Sign In
                  </a>
                </NavLink>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
