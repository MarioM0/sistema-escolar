
import 'dotenv/config';
import app from './app.js';

import { sequelize } from './models/sequelize.js';


const PORT = process.env.PORT || 3000;


async function start() {
  try {
    // Verifica la conexión con la DB
    await sequelize.authenticate();
    console.log('DB conectada correctamente');

    // Sincronizar modelos con la base de datos (crear tablas automáticamente)
    await sequelize.sync({ force: false });
    console.log('✅ Tablas sincronizadas correctamente');

    // Levantar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });

  } catch (err) {
    console.error('Error al conectar la DB', err);
  }
}

start();
