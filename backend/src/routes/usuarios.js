// backend/src/routes/usuarios.js
import express from 'express';
import bcrypt from 'bcrypt';
import { Usuario } from '../models/index.js'; // <-- asegúrate que la ruta sea correcta

const router = express.Router();

// Obtener todos los usuarios (opcional por rol)
router.get('/', async (req, res) => {
  try {
    const { rol } = req.query;
    const where = rol ? { rol: rol.toUpperCase() } : {};
    const usuarios = await Usuario.findAll({
      where,
      attributes: ['id', 'nombre', 'email', 'rol', 'matricula']
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, rol, matricula } = req.body;

    if (!nombre || !email || !password || !rol)
      return res.status(400).json({ message: 'Faltan datos obligatorios' });

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash,
      rol: rol.toUpperCase(),
      matricula: matricula || null
    });

    res.status(201).json({
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      matricula: nuevoUsuario.matricula
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.update({ nombre, email });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
});

export default router;
