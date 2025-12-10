import { Sequelize } from "sequelize";
import * as configModule from "../config.js";

const env = process.env.NODE_ENV || 'development';
const config = (configModule.default || configModule)[env];

// Crear y exportar instancia de Sequelize
export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
    define: {
      underscored: true,
    },
  }
);
