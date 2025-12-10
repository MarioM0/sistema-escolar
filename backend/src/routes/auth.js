
import express from 'express';
import bcrypt from 'bcrypt';
import { Usuario } from '../models/index.js';
import { authenticateToken, generateTokens, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// POST /auth/login - Login con generación de tokens JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email y contraseña son requeridos",
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Buscar usuario
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: "Credenciales inválidas",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ 
        message: "Credenciales inválidas",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generar tokens JWT
    const { accessToken, refreshToken } = generateTokens(user);

    // Retornar datos del usuario con tokens
    res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        matricula: user.matricula
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ 
      message: "Error interno del servidor",
      code: 'SERVER_ERROR'
    });
  }
});

// POST /auth/refresh - Renovar token de acceso
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json({ 
        message: "Refresh token requerido",
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Buscar usuario para generar nuevo access token
    const user = await Usuario.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        message: "Usuario no encontrado",
        code: 'USER_NOT_FOUND'
      });
    }

    // Generar nuevo access token
    const { accessToken } = generateTokens(user);

    res.json({
      success: true,
      accessToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error("Error en refresh token:", error);
    res.status(401).json({ 
      message: "Refresh token inválido",
      code: 'REFRESH_TOKEN_INVALID'
    });
  }
});

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

// POST /auth/logout - Logout (opcional, para invalidar refresh tokens si fuera necesario)
router.post("/logout", async (req, res) => {
  // En una implementación más avanzada, aquí podrías invalidar el refresh token
  // guardándolo en una blacklist o eliminándolo de la base de datos
  res.json({
    success: true,
    message: "Sesión cerrada exitosamente"
  });
});

export default router;
