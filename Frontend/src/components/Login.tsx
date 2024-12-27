import { NavLink } from "react-router-dom"
import logo from "../assets/logo.png"
import axios from "axios"
import { useState } from "react"

interface FormData{
  email: String,
  password: String
}

function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const{name, value} = e.target
    setFormData((prev) => ({ ...prev, [name]: value}))
    
    
    
  }
  const handleFormSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', formData.email)
    form.append('password',formData.password);
    const response = await axios.post(
      'http://127.0.0.1:8000/api/v1/users/login',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    console.log(response);
    console.log(response.data);
    console.log(response.data.status);
    
    
    
  }
  return (
    <section className="bg-gray-50 ">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img
            className=" h-12 mr-2"
            src={logo}
            alt="logo"
          />
        </a>
        <div className="w-full bg-[#ECEBDE] rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 "
                >
                  Your email
                </label>
                <input
                  onChange={handleChange}
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  onChange={handleChange}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark"
                  required
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-start">
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </a>
              </div>
              <button
                onClick={handleFormSubmit}
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-gray-900"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-center text-gray-900">
                Don’t have an account yet?{" "}
                <NavLink to="/sign-up">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500 text-gray-900"
                  >
                    Sign up
                  </a>
                </NavLink>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

  )
}

export default Login