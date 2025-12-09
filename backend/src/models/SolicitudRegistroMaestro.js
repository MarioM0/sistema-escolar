import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const SolicitudRegistroMaestro = sequelize.define('SolicitudRegistroMaestro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'), allowNull: false, defaultValue: 'pendiente' },
  fecha_solicitud: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_respuesta: { type: DataTypes.DATE, allowNull: true },
  respuesta: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'solicitudes_registro_maestro',
  timestamps: true,
});
