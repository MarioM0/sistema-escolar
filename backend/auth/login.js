const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db"); // tu archivo db.js

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Por favor completa todos los campos" });
  }

  try {
    const query = `
      SELECT id, nombre, email, password_hash, rol, matricula, grupo
      FROM usuarios
      WHERE email = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        matricula: user.matricula,
        grupo: user.grupo,
      },
      process.env.JWT_SECRET || "clave_secreta",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        matricula: user.matricula,
        grupo: user.grupo,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
