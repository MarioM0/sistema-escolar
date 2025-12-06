const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");

app.use(express.json()); // para poder leer JSON en body

// Todas las rutas de auth bajo /api
app.use("/api", authRoutes);

module.exports = app;
