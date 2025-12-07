const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'postgres_sge', // nombre del contenedor Postgres
  database: 'sge_dev',
  password: '123',       // tu contraseña real
  port: 5432
});

async function seed() {
  try {
    // Verificar usuarios existentes
    const existing = await pool.query('SELECT * FROM usuarios');
    console.log(`Usuarios existentes antes del seed: ${existing.rows.length}`);
    console.table(existing.rows);

    const saltRounds = 10;

    // Contraseñas hasheadas
    const users = [
      { nombre: 'Admin', email: 'admin@colegio.com', password: 'admin123', rol: 'CONTROL_ESCOLAR' },
      { nombre: 'Profesor Juan', email: 'juan@colegio.com', password: 'prof1234', rol: 'MAESTRO', matricula: 'MTR123' },
      { nombre: 'Profesor Ana', email: 'ana@colegio.com', password: 'prof5678', rol: 'MAESTRO', matricula: 'MTR124' },
      { nombre: 'Alumno Pedro', email: 'pedro@colegio.com', password: 'alumno123', rol: 'ALUMNO', matricula: 'ALU456', grupo: '5A' },
      { nombre: 'Alumno María', email: 'maria@colegio.com', password: 'alumno456', rol: 'ALUMNO', matricula: 'ALU457', grupo: '5A' }
    ];

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, saltRounds);
      const query = `
        INSERT INTO usuarios (nombre, email, password_hash, rol, matricula, grupo)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING *;
      `;
      const values = [user.nombre, user.email, password_hash, user.rol, user.matricula || null, user.grupo || null];
      const res = await pool.query(query, values);

      if (res.rows.length > 0) {
        console.log(`Usuario insertado:`, res.rows[0]);
      } else {
        console.log(`Usuario ya existe y no se insertó: ${user.email}`);
      }
    }

    // Verificar usuarios después del seed
    const final = await pool.query('SELECT * FROM usuarios');
    console.log(`Usuarios existentes después del seed: ${final.rows.length}`);
    console.table(final.rows);

  } catch (err) {
    console.error('Error durante el seed:', err.stack);
  } finally {
    await pool.end();
  }
}

seed();
