import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  User, 
  Image, 
  EyeOff, 
  Eye, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";

// Types
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: File | null;
  coverImage: File | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation Functions
  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // First and Last Name validations
    if (!formData.firstName) {
      newErrors.firstName = "First Name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle File Changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) return;

    setIsLoading(true);

    const form = new FormData();
    form.append("fullName", `${formData.firstName} ${formData.lastName}`);
    form.append("email", formData.email);
    form.append("username", formData.email);
    form.append("password", formData.password);
  
    if (formData.avatar) form.append("avatar", formData.avatar);
    if (formData.coverImage) form.append("coverImage", formData.coverImage);
  
    const axiosInstance = axios.create({ timeout: 50000 });
  
    try {
      const response = await axiosInstance.post(
        "http://127.0.0.1:8000/api/v1/users/register",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      if (response.data && response.data.data.accessToken) {
        const { accessToken } = response.data.data;
  
        localStorage.setItem("accessToken", accessToken);
        toast.success("Account created successfully!", {
          duration: 2000,
          position: 'top-right',
          icon: <CheckCircle color="green" />
        });
  
        // Shorter redirect delay
        setTimeout(() => navigate("/", { state: { accessToken } }), 1500);
      }
    } catch (error: any) {
      let errorMessage = "Something went wrong";
      
      if (error.response) {
        // More specific error handling
        switch(error.response.status) {
          case 400:
            errorMessage = "Invalid registration details";
            break;
          case 409:
            errorMessage = "Email already registered";
            break;
          case 500:
            errorMessage = "Server error. Please try again later";
            break;
        }
      }

      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-right',
        icon: <AlertCircle color="red" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Our Platform</h1>
          <p className="text-gray-500 mb-6">Create your account to get started</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* First Name Field */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.firstName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
            </div>
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name Field */}
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.lastName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
            </div>
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          {/* Email Field */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* File Upload Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleFileChange}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg 
                  className="animate-spin h-5 w-5 mr-3" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing Up...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Social Login & Additional Links */}
          <div className="text-center">
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-gray-300 flex-grow mr-3"></div>
              <span className="text-gray-500 text-sm">or continue with</span>
              <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              {/* Placeholder for social login icons */}
              <button 
                type="button" 
                className="p-2 border rounded-full hover:bg-gray-100 transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="#DB4437"
                >
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10-5.514 0-10-4.486-10-10 0-5.514 4.486-10 10-10zm0 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z"/>
                </svg>
              </button>
              <button 
                type="button" 
                className="p-2 border rounded-full hover:bg-gray-100 transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="#1877F2"
                >
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10-5.514 0-10-4.486-10-10 0-5.514 4.486-10 10-10z"/>
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <NavLink 
                to="/sign-in" 
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign In
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;