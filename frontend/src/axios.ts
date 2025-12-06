// frontend/src/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://backend_sge:3000", // <-- usa el nombre del contenedor / servicio
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
