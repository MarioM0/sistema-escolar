import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const ControlEscolar = sequelize.define("ControlEscolar", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "control_escolar",
  timestamps: true,
});
