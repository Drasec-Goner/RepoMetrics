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
    console.error("API Error:", err);
    return Promise.reject(err);
  }
);