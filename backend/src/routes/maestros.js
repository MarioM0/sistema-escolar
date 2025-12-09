import { Router } from "express";
import { Usuario } from "../models/index.js";
import bcrypt from "bcrypt";

const router = Router();

// Obtener conteo de maestros
router.get("/count", async (req, res) => {
  try {
    const count = await Usuario.count({ where: { rol: "MAESTRO" } });
    res.json({ count });
  } catch (error) {
    console.error("Error al obtener el conteo de maestros:", error);
    res.status(500).json({ message: "Error al obtener el conteo de maestros" });
  }
});

router.post("/", async (req, res) => {
  const { nombre, email, password, matricula } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const newMaestro = await Usuario.create({ nombre, email, password_hash: hash, rol: "MAESTRO", matricula });
    res.json(newMaestro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear maestro" });
  }
});

export default router;
