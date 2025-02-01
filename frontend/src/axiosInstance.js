import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/userLogin";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;