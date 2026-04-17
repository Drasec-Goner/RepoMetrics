import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔐 Attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log the actual error for debugging
    if (err.response) {
      console.error("API Error Response:", {
        status: err.response.status,
        data: err.response.data,
        url: err.response.config?.url,
      });
    } else if (err.request) {
      console.error("API Error Request:", err.request);
    } else {
      console.error("API Error:", err.message);
    }
    return Promise.reject(err);
  }
);