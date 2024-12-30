import axios from "axios";

const accessToken = localStorage.getItem("accessToken")
const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  export default axiosInstance

