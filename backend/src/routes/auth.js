
import express from 'express';
import { login, refreshToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { Usuario } from '../models/index.js';
import { validateLogin } from '../validators/index.js';

const router = express.Router();

// POST /auth/login - Login con generación de tokens JWT
router.post("/login", validateLogin, login);

// POST /auth/refresh - Renovar token de acceso
router.post("/refresh", refreshToken);

// GET /auth/me - Obtener información del usuario actual
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'matricula']
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      code: 'SERVER_ERROR'
    });
  }
});

// POST /auth/logout - Logout
router.post("/logout", async (req, res) => {
  res.json({
    success: true,
    message: "Sesión cerrada exitosamente"
  });
});

export default router;


