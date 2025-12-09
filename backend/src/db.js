import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // carga variables del .env

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // 🔹 usar DB_PASSWORD
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
    },
  }
);
