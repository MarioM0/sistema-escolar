import express from 'express';
import { Solicitud, Usuario } from '../models/index.js';

const router = express.Router();

// GET todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const solicitudes = await Solicitud.findAll({ include: { model: Usuario, attributes: ['id', 'nombre', 'email'] } });
    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

// POST nueva solicitud
router.post('/', async (req, res) => {
  try {
    const { alumno_id, descripcion } = req.body;
    if (!alumno_id || !descripcion) return res.status(400).json({ message: 'Faltan datos' });

    const nueva = await Solicitud.create({ alumno_id, descripcion });
    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear solicitud' });
  }
});

export default router;
