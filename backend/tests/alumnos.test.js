import request from 'supertest';
import express from 'express';
import alumnosRouter from '../src/routes/alumnos.js';
import { Alumno } from '../src/models/index.js';

const app = express();
app.use(express.json());
app.use('/alumnos', alumnosRouter);

describe('Alumnos Routes', () => {
  beforeEach(async () => {
    // Clear alumnos table before each test
    await Alumno.destroy({ where: {} });
  });

  describe('GET /alumnos/count', () => {
    it('should return the count of alumnos', async () => {
      // Create test alumnos
      await Alumno.create({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        matricula: '12345'
      });
      await Alumno.create({
        nombre: 'María García',
        email: 'maria@example.com',
        matricula: '67890'
      });

      const response = await request(app).get('/alumnos/count');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 2);
    });

    it('should return 0 when no alumnos exist', async () => {
      const response = await request(app).get('/alumnos/count');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 0);
    });
  });

  describe('GET /alumnos', () => {
    it('should return all alumnos ordered by id DESC', async () => {
      const alumno1 = await Alumno.create({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        matricula: '12345'
      });
      const alumno2 = await Alumno.create({
        nombre: 'María García',
        email: 'maria@example.com',
        matricula: '67890'
      });

      const response = await request(app).get('/alumnos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      // Should be ordered by id DESC, so newer first
      expect(response.body[0].id).toBeGreaterThan(response.body[1].id);
    });

    it('should return empty array when no alumnos exist', async () => {
      const response = await request(app).get('/alumnos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /alumnos/:id', () => {
    it('should return a specific alumno', async () => {
      const alumno = await Alumno.create({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        matricula: '12345',
        grupo: '1A'
      });

      const response = await request(app).get(`/alumnos/${alumno.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', alumno.id);
      expect(response.body).toHaveProperty('nombre', 'Juan Pérez');
      expect(response.body).toHaveProperty('email', 'juan@example.com');
      expect(response.body).toHaveProperty('matricula', '12345');
      expect(response.body).toHaveProperty('grupo', '1A');
    });

    it('should return 404 for non-existent alumno', async () => {
      const response = await request(app).get('/alumnos/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Alumno no encontrado');
    });
  });

  describe('POST /alumnos', () => {
    it('should create a new alumno', async () => {
      const newAlumno = {
        nombre: 'Carlos López',
        email: 'carlos@example.com',
        matricula: '54321',
        grupo: '2B'
      };

      const response = await request(app)
        .post('/alumnos')
        .send(newAlumno);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nombre', 'Carlos López');
      expect(response.body).toHaveProperty('email', 'carlos@example.com');
      expect(response.body).toHaveProperty('matricula', '54321');
      expect(response.body).toHaveProperty('grupo', '2B');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteAlumno = {
        nombre: 'Carlos López',
        email: 'carlos@example.com'
        // Missing matricula
      };

      const response = await request(app)
        .post('/alumnos')
        .send(incompleteAlumno);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Nombre, email y matricula son obligatorios');
    });
  });

  describe('PUT /alumnos/:id', () => {
    it('should update an existing alumno', async () => {
      const alumno = await Alumno.create({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        matricula: '12345',
        grupo: '1A'
      });

      const updatedData = {
        nombre: 'Juan Pérez García',
        email: 'juanperez@example.com',
        matricula: '12345',
        grupo: '1B'
      };

      const response = await request(app)
        .put(`/alumnos/${alumno.id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nombre', 'Juan Pérez García');
      expect(response.body).toHaveProperty('email', 'juanperez@example.com');
      expect(response.body).toHaveProperty('grupo', '1B');
    });

    it('should return 404 for non-existent alumno', async () => {
      const response = await request(app)
        .put('/alumnos/999')
        .send({
          nombre: 'Test',
          email: 'test@example.com',
          matricula: '99999'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Alumno no encontrado');
    });
  });

  describe('DELETE /alumnos/:id', () => {
    it('should delete an existing alumno', async () => {
      const alumno = await Alumno.create({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        matricula: '12345'
      });

      const response = await request(app)
        .delete(`/alumnos/${alumno.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Alumno eliminado correctamente');

      // Verify the alumno was actually deleted
      const deletedAlumno = await Alumno.findByPk(alumno.id);
      expect(deletedAlumno).toBeNull();
    });

    it('should return 404 for non-existent alumno', async () => {
      const response = await request(app)
        .delete('/alumnos/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Alumno no encontrado');
    });
  });
});
