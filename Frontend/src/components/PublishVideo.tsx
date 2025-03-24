import { useState } from "react";
import logo from "../assets/logo.svg";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PublishVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: null,
    thumbnail: null,
    isAnonymous: false,
  });

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState({
    video: false,
    thumbnail: false,
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleDrag = (e: React.DragEvent, type: "video" | "thumbnail", active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e: React.DragEvent, type: "video" | "thumbnail") => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData((prev) => ({ ...prev, [type]: e.dataTransfer.files[0] }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("isAnonymous", String(formData.isAnonymous));
      if (formData.video) {
        form.append("video", formData.video);
      }
      if (formData.thumbnail) {
        form.append("thumbnail", formData.thumbnail);
      }

      const accessToken = localStorage.getItem("accessToken");
      const axiosInstance = axios.create({
        timeout: 500000,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await axiosInstance.post(
        "http://127.0.0.1:8000/api/v1/video/publishVideo",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (data) => {
            setProgress(Math.round((100 * data.loaded) / (data.total || 1)));
          },
        }
      );

      if (response.data) {
        toast.success("Video Published Successfully");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to publish video");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileNameFromState = (fileState: File | null) => {
    if (fileState) {
      return fileState.name;
    }
    return "No file selected";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center space-x-2">
            <img className="h-12" src={logo} alt="logo" />
            <span className="text-2xl font-bold text-gray-800">Upload Center</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Share Your Content</h1>
            
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50"
                  placeholder="Enter a catchy title for your video"
                  required
                />
              </div>
              
              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your video to help viewers find it"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 min-h-32"
                  required
                />
              </div>
              
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
                    dragActive.video ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDragOver={(e) => handleDrag(e, "video", true)}
                  onDragLeave={(e) => handleDrag(e, "video", false)}
                  onDrop={(e) => handleDrop(e, "video")}
                >
                  <input
                    type="file"
                    name="video"
                    id="video-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                    required
                  />
                  <label htmlFor="video-upload" className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h18M3 16h18"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Drag and drop your video or click to browse</span>
                    <span className="mt-2 text-xs text-gray-500">{formData.video ? getFileNameFromState(formData.video) : "MP4, MOV, or AVI up to 100MB"}</span>
                  </label>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
                    dragActive.thumbnail ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDragOver={(e) => handleDrag(e, "thumbnail", true)}
                  onDragLeave={(e) => handleDrag(e, "thumbnail", false)}
                  onDrop={(e) => handleDrop(e, "thumbnail")}
                >
                  <input
                    type="file"
                    name="thumbnail"
                    id="thumbnail-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  <label htmlFor="thumbnail-upload" className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Drag and drop your thumbnail or click to browse</span>
                    <span className="mt-2 text-xs text-gray-500">{formData.thumbnail ? getFileNameFromState(formData.thumbnail) : "JPG, PNG or GIF up to 5MB"}</span>
                  </label>
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                  Upload anonymously (your username won't be displayed)
                </label>
              </div>

              {/* Progress Bar */}
              {progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Upload Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full flex justify-center items-center py-3 px-4
                          rounded-lg text-white font-medium transition duration-200
                          ${isUploading 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading Video...
                  </>
                ) : (
                  'Publish Video'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishVideo;