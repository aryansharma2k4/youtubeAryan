import { useState } from "react";
import logo from "../assets/logo.png";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PublishVideo() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video: null,
    thumbnail: null,
  });

  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
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
            setProgress(Math.round((100 * data.loaded) / data.total));
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
    }
  };

  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          <img className="h-12 mr-2" src={logo} alt="logo" />
        </a>
        <div className="w-full bg-[#ECEBDE] rounded-lg shadow sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Upload A Video</h1>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Video Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                  placeholder="Title"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg block w-full p-2.5"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Video</label>
                <input
                  type="file"
                  name="video"
                  onChange={handleFileChange}
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Thumbnail</label>
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleFileChange}
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <button
                className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-gray-900"
              >
                Upload Video
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PublishVideo;
