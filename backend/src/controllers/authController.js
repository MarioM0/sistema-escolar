import bcrypt from 'bcrypt';
import { Usuario } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
        code: 'INVALID_CREDENTIALS'
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        message: "Credenciales inválidas",
        code: 'INVALID_CREDENTIALS'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

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
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token requerido",
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await Usuario.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
        code: 'USER_NOT_FOUND'
      });
    }

    const { accessToken } = generateTokens(user);

    res.json({
      success: true,
      accessToken,
      expiresIn: '24h'
    });
  } catch (err) {
    console.error("Error en refresh:", err);
    res.status(401).json({
      message: "Token inválido o expirado",
      code: 'INVALID_TOKEN'
    });
  }
};
