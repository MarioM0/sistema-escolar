import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const MateriaMaestro = sequelize.define("MateriaMaestro", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'materias',
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
}, {
  tableName: "materia_maestro",
  timestamps: true,
});

export default MateriaMaestro;
