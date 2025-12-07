const express = require("express");
const cors = require("cors");       // <--- importar CORS
const app = express();
const authRoutes = require("./routes/auth");

app.use(express.json()); // para poder leer JSON en body

// Habilitar CORS para tu frontend
app.use(cors({
  origin: "http://localhost:5173",  // la URL donde corre tu frontend
  credentials: true
}));

// Todas las rutas de auth bajo /api
app.use("/api", authRoutes);

module.exports = app;
