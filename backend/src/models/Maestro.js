import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Maestro = sequelize.define("Maestro", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  matricula: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false }, // contraseña obligatoria
}, {
  tableName: "maestros",
  timestamps: true,
});
