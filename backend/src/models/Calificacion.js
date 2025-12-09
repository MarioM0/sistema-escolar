import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Calificacion = sequelize.define('Calificacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  alumno_id: { type: DataTypes.INTEGER, allowNull: false },
  materia_id: { type: DataTypes.INTEGER, allowNull: false },
  maestro_id: { type: DataTypes.INTEGER, allowNull: false },
  nota: { type: DataTypes.FLOAT, allowNull: true },
  fecha_registro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  observaciones: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'calificaciones',
  timestamps: true,
});
