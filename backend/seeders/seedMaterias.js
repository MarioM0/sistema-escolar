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
      { codigo: 'MAT101', nombre: 'Matemáticas', descripcion: 'Álgebra y Geometría' },
      { codigo: 'ESP101', nombre: 'Español', descripcion: 'Literatura y Gramática' },
      { codigo: 'HIS101', nombre: 'Historia', descripcion: 'Historia Universal' },
      { codigo: 'MAT102', nombre: 'Cálculo', descripcion: 'Cálculo Diferencial' },
      { codigo: 'ESP102', nombre: 'Literatura', descripcion: 'Literatura Clásica' },
      { codigo: 'HIS102', nombre: 'Geografía', descripcion: 'Geografía Física' },
    ];

    // Insertar materias
    for (const m of materias) {
      await pool.query(
        `INSERT INTO materias (codigo, nombre, descripcion, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (codigo) DO NOTHING`,
        [m.codigo, m.nombre, m.descripcion]
      );
      console.log(`Materia insertada: ${m.nombre}`);
    }

    // Obtener los IDs de las materias insertadas
    const materiasInsertadas = await pool.query('SELECT id FROM materias');

    // Asignar materias a maestros (materia_maestro)
    let grupoIndex = 0;
    const grupos = ['1A', '1B', '1C', '2A', '2B', '2C'];

    for (let i = 0; i < materiasInsertadas.rows.length; i++) {
      const materiaId = materiasInsertadas.rows[i].id;
      const maestroId = maestros.rows[i % maestros.rows.length].id;
      const grupo = grupos[grupoIndex % grupos.length];

      await pool.query(
        `INSERT INTO materia_maestro (materia_id, usuario_id, grupo, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [materiaId, maestroId, grupo]
      );
      console.log(`Materia ${materiaId} asignada a maestro ${maestroId} en grupo ${grupo}`);
      grupoIndex++;
    }

    console.log('Seed de materias completado ✅');
  } catch (err) {
    console.error('Error seed materias:', err);
  } finally {
    await pool.end();
  }
}

seedMaterias();

