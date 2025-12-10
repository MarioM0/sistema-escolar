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

async function seedCalificaciones() {
  try {
    // First get the IDs of teachers, students, and subject-teacher assignments
    const maestros = await pool.query('SELECT id, nombre FROM usuarios WHERE rol = $1', ['MAESTRO']);
    const alumnos = await pool.query('SELECT id, nombre, grupo FROM alumnos');
    const materiaMaestros = await pool.query(`
      SELECT mm.materia_id, mm.usuario_id, mm.grupo, m.nombre as materia_nombre
      FROM materia_maestro mm
      JOIN materias m ON mm.materia_id = m.id
    `);

    console.log('Maestros encontrados:', maestros.rows.length);
    console.log('Alumnos encontrados:', alumnos.rows.length);
    console.log('Asignaciones materia-maestro encontradas:', materiaMaestros.rows.length);

    // Create some sample grades
    const calificaciones = [];

    // For each teacher
    for (const maestro of maestros.rows) {
      // For each subject they teach in each group
      const asignacionesMaestro = materiaMaestros.rows.filter(mm => mm.usuario_id === maestro.id);

      for (const asignacion of asignacionesMaestro) {
        // For each student in the same group as the assignment
        const alumnosGrupo = alumnos.rows.filter(a => a.grupo === asignacion.grupo);

        for (const alumno of alumnosGrupo) {
          // Generate a random grade between 6.0 and 10.0
          const nota = Math.round((Math.random() * 4 + 6) * 10) / 10;

          calificaciones.push({
            alumno_id: alumno.id,
            materia_id: asignacion.materia_id,
            maestro_id: maestro.id,
            nota: nota
          });
        }
      }
    }

    // Insert the grades
    for (const calif of calificaciones) {
      await pool.query(
        `INSERT INTO calificaciones (alumno_id, materia_id, maestro_id, nota, fecha_registro)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [calif.alumno_id, calif.materia_id, calif.maestro_id, calif.nota]
      );
    }

    console.log(`Se insertaron ${calificaciones.length} calificaciones de ejemplo ✅`);
  } catch (err) {
    console.error('Error seed calificaciones:', err);
  } finally {
    await pool.end();
  }
}

export default seedCalificaciones;
