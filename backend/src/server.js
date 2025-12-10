
import 'dotenv/config';
import app from './app.js';
import bcrypt from 'bcrypt';

import { sequelize } from './models/sequelize.js';
import { Usuario, Alumno, Materia, Calificacion } from './models/index.js';

const PORT = process.env.PORT || 3000;

// Función para ejecutar seeders
async function runSeeders() {
  try {
    const usuariosCount = await Usuario.count();
    if (usuariosCount > 0) {
      console.log('ℹ️ Base de datos ya contiene datos. Saltando seeders...');
      return;
    }

    console.log('🌱 Ejecutando seeders...');

    // Seeders manuales (importar las funciones)
    try {
      // Generar hashes de contraseñas
      const adminHash = await bcrypt.hash('admin123', 10);
      const prof123Hash = await bcrypt.hash('prof123', 10);
      const prof456Hash = await bcrypt.hash('prof456', 10);

      // Usuario seeder
      const usersData = [
        {
          nombre: 'Admin Colegio',
          email: 'admin@colegio.com',
          password_hash: adminHash,
          rol: 'CONTROL_ESCOLAR',
          matricula: null
        },
        {
          nombre: 'Juan Profesor',
          email: 'juan@colegio.com',
          password_hash: prof123Hash,
          rol: 'MAESTRO',
          matricula: 'PROF001'
        },
        {
          nombre: 'Ana Profesor',
          email: 'ana@colegio.com',
          password_hash: prof456Hash,
          rol: 'MAESTRO',
          matricula: 'PROF002'
        }
      ];

      for (const userData of usersData) {
        await Usuario.create(userData);
      }
      console.log('✅ Usuarios creados');

      // Materias seeder
      const materiasData = [
        { codigo: 'MAT101', nombre: 'Matemáticas', descripcion: 'Curso de matemáticas básicas' },
        { codigo: 'ESP101', nombre: 'Español', descripcion: 'Curso de lengua española' },
        { codigo: 'ENG101', nombre: 'Inglés', descripcion: 'Curso de lengua inglesa' },
        { codigo: 'CIEN101', nombre: 'Ciencias Naturales', descripcion: 'Curso de ciencias' },
        { codigo: 'HIST101', nombre: 'Historia', descripcion: 'Curso de historia' },
        { codigo: 'ED101', nombre: 'Educación Física', descripcion: 'Curso de educación física' }
      ];

      for (const materia of materiasData) {
        await Materia.create(materia);
      }
      console.log('✅ Materias creadas');

      // Alumnos seeder
      const alumnosData = [
        { nombre: 'Carlos López', email: 'carlos@colegio.com', matricula: 'ALU001', grupo: '6A' },
        { nombre: 'María García', email: 'maria@colegio.com', matricula: 'ALU002', grupo: '6A' },
        { nombre: 'Luis Martínez', email: 'luis@colegio.com', matricula: 'ALU003', grupo: '6B' },
        { nombre: 'Ana Rodríguez', email: 'ana.rod@colegio.com', matricula: 'ALU004', grupo: '6B' },
        { nombre: 'Pedro Sánchez', email: 'pedro@colegio.com', matricula: 'ALU005', grupo: '6C' },
        { nombre: 'Laura Fernández', email: 'laura@colegio.com', matricula: 'ALU006', grupo: '6C' }
      ];

      for (const alumno of alumnosData) {
        await Alumno.create(alumno);
      }
      console.log('✅ Alumnos creados');

      console.log('✅ Seeders ejecutados correctamente');
    } catch (error) {
      console.error('Error ejecutando seeders:', error.message);
    }
  } catch (error) {
    console.error('Error en runSeeders:', error);
  }
}

async function start() {
  try {
    // Verifica la conexión con la DB
    await sequelize.authenticate();
    console.log('DB conectada correctamente');

    // Sincronizar modelos con la base de datos (crear tablas automáticamente)
    await sequelize.sync({ force: false });
    console.log('✅ Tablas sincronizadas correctamente');

    // Ejecutar seeders
    await runSeeders();

    // Levantar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });

  } catch (err) {
    console.error('Error al conectar la DB', err);
  }
}

start();
