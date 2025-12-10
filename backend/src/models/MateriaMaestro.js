
import { DataTypes } from "sequelize";
import { sequelize } from "./sequelize.js";

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
  grupo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "materia_maestro",
  timestamps: true,
});

export default MateriaMaestro;
