import axios from "axios";

// Determine the API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development: use relative path (Vite proxy will handle it)
  if (import.meta.env.DEV) {
    return "/api";
  }

  // Production: use window.location.origin
  return `${window.location.origin}/api`;
};

const api = axios.create({
  baseURL: getApiUrl(),
});

console.log("API Base URL:", api.defaults.baseURL);

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.message);

    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/";
    }

    // Handle network errors
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      console.error("Network error - API server may be down or unreachable");
    }

    return Promise.reject(error);
  }
);

export default api;
