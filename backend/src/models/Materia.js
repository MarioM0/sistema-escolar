import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

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
  grupo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  maestro_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
}, {
  tableName: "materias",
  timestamps: true,
});

export default Materia;
