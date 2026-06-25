import axios from "axios";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const defaultApiUrl = isLocalhost ? "http://localhost:5000/api" : "https://codelab-526i.vercel.app/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

// attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if we get 401, clear token and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // dont redirect if already on login/register page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
