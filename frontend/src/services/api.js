import axios from "axios";

const api = axios.create({
  baseURL: "https://marraige-hall-management-portal.vercel.app//api",
  headers: { "Content-Type": "application/json" },
});

// Attach adminToken to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;