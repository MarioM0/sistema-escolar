
import { DataTypes } from "sequelize";
import { sequelize } from "./sequelize.js";

export const Materia = sequelize.define("Materia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "materias",
  timestamps: true,
});

export default Materia;
