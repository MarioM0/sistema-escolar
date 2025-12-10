
import { DataTypes } from 'sequelize';
import { sequelize } from './sequelize.js';

export const Solicitud = sequelize.define('Solicitud', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.ENUM('cambio_grupo', 'cambio_materia', 'otro'), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  estado: { type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'), allowNull: false, defaultValue: 'pendiente' },
  fecha_solicitud: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_respuesta: { type: DataTypes.DATE, allowNull: true },
  respuesta: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'solicitudes',
  timestamps: true,
});
