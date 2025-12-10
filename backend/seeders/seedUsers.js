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

async function seedUsers() {
  try {
    const saltRounds = 10;

    const users = [
      { nombre: 'Admin', email: 'admin@colegio.com', password: 'admin123', rol: 'CONTROL_ESCOLAR' },
      { nombre: 'Profesor Juan', email: 'juan@colegio.com', password: 'prof123', rol: 'MAESTRO', matricula: 'MTR123' },
      { nombre: 'Profesor Ana', email: 'ana@colegio.com', password: 'prof456', rol: 'MAESTRO', matricula: 'MTR124' },
    ];

    for (const u of users) {
      const password_hash = await bcrypt.hash(u.password, saltRounds);
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, matricula, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [u.nombre, u.email, password_hash, u.rol, u.matricula || null]
      );
      console.log(`Usuario insertado: ${u.email}`);
    }

    console.log('Seed de usuarios completado ✅');
  } catch (err) {
    console.error('Error seed usuarios:', err);
  } finally {
    await pool.end();
  }
}

seedUsers();   // 👉 FALTA ESTO
