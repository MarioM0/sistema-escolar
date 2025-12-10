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

async function seedMaterias() {
  try {
    // Get teacher IDs
    const maestros = await pool.query('SELECT id, nombre FROM usuarios WHERE rol = $1', ['MAESTRO']);

    if (maestros.rows.length === 0) {
      console.log('No se encontraron maestros. Ejecuta seedUsers.js primero.');
      return;
    }

    const materias = [
      { codigo: 'MAT101', nombre: 'Matemáticas', grupo: '1A', maestro_id: maestros.rows[0].id },
      { codigo: 'ESP101', nombre: 'Español', grupo: '1A', maestro_id: maestros.rows[0].id },
      { codigo: 'HIS101', nombre: 'Historia', grupo: '1A', maestro_id: maestros.rows[1].id },
      { codigo: 'MAT102', nombre: 'Matemáticas', grupo: '1B', maestro_id: maestros.rows[1].id },
      { codigo: 'ESP102', nombre: 'Español', grupo: '1B', maestro_id: maestros.rows[1].id },
      { codigo: 'HIS102', nombre: 'Historia', grupo: '1B', maestro_id: maestros.rows[0].id },
    ];

    for (const m of materias) {
      await pool.query(
        `INSERT INTO materias (codigo, nombre, grupo, maestro_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (codigo) DO NOTHING`,
        [m.codigo, m.nombre, m.grupo, m.maestro_id]
      );
      console.log(`Materia insertada: ${m.nombre} - ${m.grupo}`);
    }

    console.log('Seed de materias completado ✅');
  } catch (err) {
    console.error('Error seed materias:', err);
  } finally {
    await pool.end();
  }
}

export default seedMaterias;
