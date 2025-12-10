import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function seedAlumnos() {
  try {
    const alumnos = [
      { nombre: 'Pedro García', matricula: 'ALU001', email: 'pedro@colegio.com', grupo: '1A' },
      { nombre: 'María López', matricula: 'ALU002', email: 'maria@colegio.com', grupo: '1A' },
      { nombre: 'Luis Martínez', matricula: 'ALU003', email: 'luis@colegio.com', grupo: '1B' },
      { nombre: 'Ana Rodríguez', matricula: 'ALU004', email: 'ana.est@colegio.com', grupo: '1B' },
      { nombre: 'Carlos Fernández', matricula: 'ALU005', email: 'carlos@colegio.com', grupo: '1C' },
      { nombre: 'Sofia Díaz', matricula: 'ALU006', email: 'sofia@colegio.com', grupo: '1C' },
    ];

    for (const a of alumnos) {
      await pool.query(
        `INSERT INTO alumnos (nombre, matricula, email, grupo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [a.nombre, a.matricula, a.email, a.grupo]
      );
      console.log(`Alumno insertado: ${a.nombre} - ${a.matricula}`);
    }

    console.log('Seed de alumnos completado ✅');
  } catch (err) {
    console.error('Error seed alumnos:', err);
  } finally {
    await pool.end();
  }
}

seedAlumnos();
