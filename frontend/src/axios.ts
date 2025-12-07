import axios from "axios";

const baseURL = window.location.hostname === "localhost"
  ? "http://localhost:3000/api" // desde el navegador
  : "http://backend:3000/api";   // desde contenedor frontend

const api = axios.create({ baseURL });

export default api;
