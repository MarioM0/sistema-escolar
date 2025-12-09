// backend/src/models/Usuario.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.STRING, allowNull: false }, // admin, maestro, alumno, etc.
  matricula: { type: DataTypes.STRING, allowNull: true }, // Para maestros
}, {
  tableName: 'usuarios',
  timestamps: false,
});
