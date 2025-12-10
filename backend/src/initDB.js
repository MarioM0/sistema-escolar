
// src/initDB.js

import { sequelize } from './models/sequelize.js';

export async function createTables() {
  try {
    // Sincronizar todos los modelos con la base de datos
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tablas creadas/sincronizadas correctamente');
  } catch (err) {
    console.error('❌ Error creando las tablas:', err);
  }
}
