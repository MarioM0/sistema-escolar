

import express from 'express';
import bcrypt from 'bcrypt';
import { SolicitudRegistroMaestro, Usuario } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST nueva solicitud de registro de maestro - RUTA PÚBLICA (sin auth)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ message: 'Faltan datos' });

    const password_hash = await bcrypt.hash(password, 10);
    const nueva = await SolicitudRegistroMaestro.create({ nombre, email, password_hash });
    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear solicitud de registro de maestro' });
  }
});

// Aplicar middleware de autenticación solo a las rutas que lo necesitan
router.use(authenticateToken);

// GET todas las solicitudes de registro de maestro pendientes
router.get('/', async (req, res) => {
  try {
    const solicitudes = await SolicitudRegistroMaestro.findAll({
      where: { estado: 'pendiente' }
    });
    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener solicitudes de registro de maestro' });
  }
});

// GET /solicitudes-registro-maestro/count - Contar solicitudes pendientes
router.get('/count', async (req, res) => {
  try {
    const count = await SolicitudRegistroMaestro.count({
      where: { estado: 'pendiente' }
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el conteo de solicitudes pendientes' });
  }

});

// PUT aprobar solicitud de registro de maestro
router.put('/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, matricula } = req.body;
    const solicitud = await SolicitudRegistroMaestro.findByPk(id);
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

    // Crear usuario maestro con datos proporcionados
    const password_hash = await bcrypt.hash(password, 10);
    const matriculaFinal = matricula || `MTR${Math.floor(Math.random() * 900 + 100)}`;
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash,
      rol: 'MAESTRO',
      matricula: matriculaFinal
    });

    // Marcar solicitud como aprobada
    await solicitud.update({
      estado: 'aprobada',
      fecha_respuesta: new Date(),
      respuesta: 'Solicitud aprobada. Usuario creado exitosamente.'
    });

    // Respuesta simplificada sin datos sensibles del usuario creado
    res.json({ 
      success: true, 
      message: 'Solicitud aprobada y usuario maestro creado exitosamente',
      data: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        matricula: nuevoUsuario.matricula
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al aprobar solicitud' });
  }
});

// PUT rechazar solicitud de registro de maestro
router.put('/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;
    const solicitud = await SolicitudRegistroMaestro.findByPk(id);
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    await solicitud.update({
      estado: 'rechazada',
      fecha_respuesta: new Date(),
      respuesta: respuesta || 'Solicitud rechazada'
    });
    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al rechazar solicitud' });
  }
});

// DELETE eliminar solicitud de registro de maestro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await SolicitudRegistroMaestro.findByPk(id);
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    await solicitud.destroy();
    res.json({ message: 'Solicitud eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar solicitud' });
  }
});

export default router;
