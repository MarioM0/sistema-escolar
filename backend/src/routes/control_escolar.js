import express from "express";
import { ControlEscolar } from "../models/ControlEscolar.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const adminExist = await ControlEscolar.findOne({ where: { email } });
    if (adminExist) return res.status(400).json({ message: "El correo ya existe" });

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoAdmin = await ControlEscolar.create({ nombre, email, password_hash });
    res.json(nuevoAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear control escolar" });
  }
});

export default router;
