import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAlumnosByMaestro,
  createCalificacionMaestro,
  getCalificacionesByMaestro
} from '../controllers/maestroController.js';

const router = express.Router();

// Middleware para proteger todas las rutas de maestro
router.use(authenticateToken);

// GET /maestro/alumnos - Obtener alumnos asignados al maestro autenticado
router.get("/alumnos", getAlumnosByMaestro);

// GET /maestro/calificaciones - Obtener calificaciones registradas por el maestro
router.get("/calificaciones", getCalificacionesByMaestro);

// POST /maestro/calificaciones - Registrar nueva calificación
router.post("/calificaciones", createCalificacionMaestro);

export default router;
