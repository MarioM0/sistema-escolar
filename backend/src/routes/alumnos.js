// backend/src/routes/alumnos.js
import { Router } from "express";
import { Alumno } from "../models/index.js";

const router = Router();

// GET /alumnos/count
router.get("/count", async (req, res) => {
  try {
    const count = await Alumno.count();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener el conteo de alumnos" });
  }
});

// GET /alumnos - Obtener todos los alumnos
router.get("/", async (req, res) => {
  try {
    const alumnos = await Alumno.findAll({
      order: [['id', 'DESC']]
    });
    res.json(alumnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
});

// GET /alumnos/:id - Obtener un alumno por ID
router.get("/:id", async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }
    res.json(alumno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener alumno" });
  }
});

// POST /alumnos
router.post("/", async (req, res) => {
  const { nombre, email, matricula, grupo } = req.body;

  if (!nombre || !email || !matricula) {
    return res.status(400).json({ message: "Nombre, email y matricula son obligatorios" });
  }

  try {
    const newAlumno = await Alumno.create({
      nombre,
      email,
      matricula,
      grupo,
    });
    res.json(newAlumno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear alumno" });
  }
});

// PUT /alumnos/:id - Actualizar un alumno
router.put("/:id", async (req, res) => {
  const { nombre, email, matricula, grupo } = req.body;

  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    await alumno.update({
      nombre,
      email,
      matricula,
      grupo,
    });

    res.json(alumno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar alumno" });
  }
});

// DELETE /alumnos/:id - Eliminar un alumno
router.delete("/:id", async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    await alumno.destroy();
    res.json({ message: "Alumno eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar alumno" });
  }
});

export default router;
