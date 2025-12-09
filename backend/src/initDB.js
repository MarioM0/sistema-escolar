// src/initDB.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
});

export async function createTables() {
  try {
    await pool.query(`
      -- 1️⃣ Tabla usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('MAESTRO','CONTROL_ESCOLAR')),
        password_hash VARCHAR(255) NOT NULL,
        matricula VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 2️⃣ Tabla alumnos
      CREATE TABLE IF NOT EXISTS alumnos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        fecha_nacimiento DATE,
        matricula VARCHAR(50) UNIQUE NOT NULL,
        grupo VARCHAR(20),
        usuario_id INT REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 3️⃣ Tabla materias
      CREATE TABLE IF NOT EXISTS materias (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        grupo VARCHAR(20) UNIQUE NOT NULL,
        maestro_id INT REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 3.1️⃣ Tabla materia_maestro (relación many-to-many)
      CREATE TABLE IF NOT EXISTS materia_maestro (
        id SERIAL PRIMARY KEY,
        materia_id INT REFERENCES materias(id) ON DELETE CASCADE,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(materia_id, usuario_id)
      );

      -- 4️⃣ Tabla solicitudes
      CREATE TABLE IF NOT EXISTS solicitudes (
        id SERIAL PRIMARY KEY,
        alumno_id INT REFERENCES alumnos(id) ON DELETE CASCADE,
        materia_id INT REFERENCES materias(id) ON DELETE CASCADE,
        usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
        nota NUMERIC(5,2),
        fecha_registro TIMESTAMP DEFAULT NOW(),
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 5️⃣ Tabla solicitudes_registro_maestro
      CREATE TABLE IF NOT EXISTS solicitudes_registro_maestro (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
        fecha_solicitud TIMESTAMP DEFAULT NOW(),
        fecha_respuesta TIMESTAMP,
        respuesta TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Agregar columnas faltantes si no existen
    try {
      await pool.query(`ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id);`);
      await pool.query(`ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE;`);
      await pool.query(`ALTER TABLE materias ADD COLUMN IF NOT EXISTS maestro_id INT REFERENCES usuarios(id);`);
      console.log('✅ Columnas agregadas correctamente');
    } catch (alterErr) {
      console.log('⚠️  Algunas columnas ya existen o error al agregar:', alterErr.message);
    }

    console.log('✅ Tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error creando las tablas:', err);
  } finally {
    await pool.end();
  }
}
