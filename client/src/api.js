import axios from "axios";

// Vercel pe REACT_APP_API_URL set karo, local pe proxy use hoga
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  timeout: 30000,
});

// Har request mein token auto-attach
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 pe auto-logout
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
