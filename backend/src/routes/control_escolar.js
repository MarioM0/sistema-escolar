import express from "express";
import { ControlEscolar } from "../models/ControlEscolar.js";
import { Calificacion } from "../models/Calificacion.js";
import { Alumno } from "../models/Alumno.js";
import { Materia } from "../models/Materia.js";
import { Usuario } from "../models/Usuario.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const adminExist = await ControlEscolar.findOne({ where: { email } });
    if (adminExist) return res.status(400).json({ message: "El correo ya existe" });

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoAdmin = await ControlEscolar.create({ nombre, email, password_hash });
    res.json(nuevoAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear control escolar" });
  }
});

export default router;

// Reporte de calificaciones (incluye alumno, materia y maestro)
router.get('/reporte', async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({
      include: [
        { model: Alumno, as: 'alumno', attributes: ['id', 'nombre'] },
        { model: Materia, as: 'materia', attributes: ['id', 'nombre'] },
        { model: Usuario, as: 'maestro', attributes: ['id', 'nombre', 'email'] }
      ],
      order: [['fecha_registro', 'DESC']]
    });

    res.json(calificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando reporte' });
  }
});

// DELETE (soft) de una calificación por id
router.delete('/calificaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cal = await Calificacion.findByPk(id);
    if (!cal) return res.status(404).json({ message: 'Calificación no encontrada' });

    await cal.destroy();
    res.json({ message: 'Calificación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando calificación' });
  }
});
