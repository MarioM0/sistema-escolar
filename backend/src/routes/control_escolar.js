import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getReporte,
  deleteCalificacion
} from "../controllers/controlEscolarController.js";

const router = express.Router();

// Middleware para proteger todas las rutas
router.use(authenticateToken);

// GET /control_escolar/reporte - Obtener reporte de calificaciones
router.get("/reporte", getReporte);

// DELETE /control_escolar/calificaciones/:id - Eliminar calificación (soft delete)
router.delete("/calificaciones/:id", deleteCalificacion);

export default router;
