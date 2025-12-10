import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-jwt-secret-super-seguro-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'TOKEN_MISSING'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuario en base de datos para validar que aún existe
    const user = await Usuario.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      matricula: user.matricula
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    } else {
      console.error('Error en autenticación JWT:', error);
      return res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'SERVER_ERROR'
      });
    }
  }
};

// Función para generar tokens JWT
export const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

// Función para verificar refresh token
export const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, JWT_SECRET);
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

export default { authenticateToken, generateTokens, verifyRefreshToken };

