import bcrypt from 'bcrypt';
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
      { nombre: 'Pedro', email: 'pedro@colegio.com', matricula: 'ALU001', grupo: '5A', fecha_nacimiento: '2010-05-12' },
      { nombre: 'María', email: 'maria@colegio.com', matricula: 'ALU002', grupo: '5A', fecha_nacimiento: '2010-07-20' },
      { nombre: 'Luis', email: 'luis@colegio.com', matricula: 'ALU003', grupo: '5B', fecha_nacimiento: '2010-03-18' },
    ];

    for (const a of alumnos) {
      await pool.query(
        `INSERT INTO alumnos (nombre, email, matricula, grupo, fecha_nacimiento)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [a.nombre, a.email, a.matricula, a.grupo, a.fecha_nacimiento]
      );
      console.log(`Alumno insertado: ${a.email}`);
    }

    console.log('Seed de alumnos completado ✅');
  } catch (err) {
    console.error('Error seed alumnos:', err);
  } finally {
    await pool.end();
  }
}

export default seedAlumnos;
