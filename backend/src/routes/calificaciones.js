import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createCalificacion,
  getPromedioGeneral,
  getCalificacionesPorAlumno,
  deleteCalificacion
} from "../controllers/calificacionesController.js";
import {
  validateCreateCalificacion,
  validateGetAlumnoById,
  validateDeleteCalificacion
} from "../validators/index.js";

const router = Router();

// Middleware para proteger todas las rutas
router.use(authenticateToken);

// GET /calificaciones/promedio-general - Obtener promedio general
router.get("/promedio-general", getPromedioGeneral);

// GET /calificaciones/alumno/:alumnoId - Obtener calificaciones de un alumno
router.get("/alumno/:alumnoId", validateGetAlumnoById, getCalificacionesPorAlumno);

// POST /calificaciones - Crear nueva calificación
router.post("/", validateCreateCalificacion, createCalificacion);

// DELETE /calificaciones/:id - Eliminar calificación
router.delete("/:id", validateDeleteCalificacion, deleteCalificacion);

export default router;
