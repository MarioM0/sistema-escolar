// frontend/src/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://backend:3000/api", // Soporta Docker y dev local
  withCredentials: true, // si usas cookies para auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
