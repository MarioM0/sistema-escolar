import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';
import { createTables } from './initDB.js';
import seedUsers from '../seeders/seedUsers.js';
import seedAlumnos from '../seeders/seedAlumnos.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Verifica la conexión con la DB
    await sequelize.authenticate();
    console.log('DB conectada correctamente');

    // Ejecutar seeders solo si se especifica la variable de entorno RUN_SEEDERS=true
    if (process.env.RUN_SEEDERS === 'true') {
      console.log('🔄 Ejecutando seeders...');
      await createTables();
      await seedUsers();
      await seedAlumnos();
    } else {
      console.log('ℹ️  Seeders omitidos. Para ejecutar seeders, establece RUN_SEEDERS=true');
    }

    // Levantar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });

  } catch (err) {
    console.error('Error al conectar la DB', err);
  }
}

start();
