const express = require('express');
const router = express.Router();
const { Usuarios } = require('../models'); // tu modelo Usuarios
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await Usuarios.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({ token, name: user.nombre, email: user.email, rol: user.rol });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

module.exports = router;
