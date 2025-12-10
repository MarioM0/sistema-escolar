import request from 'supertest';
import express from 'express';
import maestrosRouter from '../src/routes/maestros.js';
import { Usuario, Materia, Alumno, Calificacion, MateriaMaestro } from '../src/models/index.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/maestros', maestrosRouter);

describe('Maestros Routes', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await Calificacion.destroy({ where: {} });
    await MateriaMaestro.destroy({ where: {} });
    await Materia.destroy({ where: {} });
    await Alumno.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
  });

  describe('GET /maestros/count', () => {
    it('should return the count of maestros', async () => {
      // Create test maestros
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });
      await Usuario.create({
        nombre: 'Profesor María',
        email: 'maria@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT002'
      });
      // Create a non-maestro user
      await Usuario.create({
        nombre: 'Alumno Pedro',
        email: 'pedro@example.com',
        password_hash: hashedPassword,
        rol: 'ALUMNO'
      });

      const response = await request(app).get('/maestros/count');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 2);
    });
  });

  describe('POST /maestros', () => {
    it('should create a new maestro', async () => {
      const newMaestro = {
        nombre: 'Profesor Carlos',
        email: 'carlos@example.com',
        password: 'password123',
        matricula: 'MAT003'
      };

      const response = await request(app)
        .post('/maestros')
        .send(newMaestro);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nombre', 'Profesor Carlos');
      expect(response.body).toHaveProperty('email', 'carlos@example.com');
      expect(response.body).toHaveProperty('rol', 'MAESTRO');
      expect(response.body).toHaveProperty('matricula', 'MAT003');
    });
  });

  describe('GET /maestros', () => {
    it('should return all maestros', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro1 = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });
      const maestro2 = await Usuario.create({
        nombre: 'Profesor María',
        email: 'maria@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT002'
      });

      const response = await request(app).get('/maestros');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('nombre', 'Profesor Juan');
      expect(response.body[1]).toHaveProperty('nombre', 'Profesor María');
    });
  });

  describe('GET /maestros/:id', () => {
    it('should return a specific maestro', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      const response = await request(app).get(`/maestros/${maestro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', maestro.id);
      expect(response.body).toHaveProperty('nombre', 'Profesor Juan');
      expect(response.body).toHaveProperty('email', 'juan@example.com');
      expect(response.body).toHaveProperty('matricula', 'MAT001');
    });

    it('should return 404 for non-existent maestro', async () => {
      const response = await request(app).get('/maestros/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Maestro no encontrado');
    });
  });

  describe('PUT /maestros/:id', () => {
    it('should update a maestro', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      const updatedData = {
        nombre: 'Profesor Juan Carlos',
        email: 'juancarlos@example.com',
        matricula: 'MAT001-UPDATED'
      };

      const response = await request(app)
        .put(`/maestros/${maestro.id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nombre', 'Profesor Juan Carlos');
      expect(response.body).toHaveProperty('email', 'juancarlos@example.com');
      expect(response.body).toHaveProperty('matricula', 'MAT001-UPDATED');
    });
  });

  describe('DELETE /maestros/:id', () => {
    it('should delete a maestro', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      const response = await request(app)
        .delete(`/maestros/${maestro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Maestro eliminado correctamente');
    });
  });

  describe('GET /maestros/:id/stats', () => {
    it('should return maestro stats', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subjects
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas'
      });
      const materia2 = await Materia.create({
        codigo: 'MAT102',
        nombre: 'Álgebra'
      });

      // Create teacher-subject assignments
      await MateriaMaestro.create({
        materia_id: materia1.id,
        usuario_id: maestro.id,
        grupo: '1A'
      });
      await MateriaMaestro.create({
        materia_id: materia2.id,
        usuario_id: maestro.id,
        grupo: '1B'
      });

      // Create students
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });
      const alumno2 = await Alumno.create({
        nombre: 'Estudiante 2',
        email: 'est2@example.com',
        matricula: 'EST002',
        grupo: '1A'
      });
      const alumno3 = await Alumno.create({
        nombre: 'Estudiante 3',
        email: 'est3@example.com',
        matricula: 'EST003',
        grupo: '1B'
      });

      // Create grades
      await Calificacion.create({
        alumno_id: alumno1.id,
        maestro_id: maestro.id,
        nota: 8.5
      });
      await Calificacion.create({
        alumno_id: alumno2.id,
        maestro_id: maestro.id,
        nota: 9.0
      });
      await Calificacion.create({
        alumno_id: alumno3.id,
        maestro_id: maestro.id,
        nota: 7.5
      });

      const response = await request(app).get(`/maestros/${maestro.id}/stats`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('groups', 2);
      expect(response.body).toHaveProperty('students', 3);
      expect(response.body).toHaveProperty('avgGrade', 8.3);
    });
  });

  describe('GET /maestros/:id/groups', () => {
    it('should return maestro groups with stats', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subjects
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas'
      });

      // Create teacher-subject assignment
      await MateriaMaestro.create({
        materia_id: materia1.id,
        usuario_id: maestro.id,
        grupo: '1A'
      });

      // Create students
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });

      // Create grade
      await Calificacion.create({
        alumno_id: alumno1.id,
        maestro_id: maestro.id,
        nota: 8.5
      });

      const response = await request(app).get(`/maestros/${maestro.id}/groups`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('name', '1A');
      expect(response.body[0]).toHaveProperty('students', 1);
      expect(response.body[0]).toHaveProperty('avgGrade', 8.5);
    });
  });

  describe('GET /maestros/:id/grades', () => {
    it('should return all students with grades for the teacher', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subjects
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas'
      });
      const materia2 = await Materia.create({
        codigo: 'MAT102',
        nombre: 'Álgebra'
      });

      // Create teacher-subject assignments
      await MateriaMaestro.create({
        materia_id: materia1.id,
        usuario_id: maestro.id,
        grupo: '1A'
      });
      await MateriaMaestro.create({
        materia_id: materia2.id,
        usuario_id: maestro.id,
        grupo: '1B'
      });

      // Create students
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });
      const alumno2 = await Alumno.create({
        nombre: 'Estudiante 2',
        email: 'est2@example.com',
        matricula: 'EST002',
        grupo: '1B'
      });

      // Create grades
      await Calificacion.create({
        alumno_id: alumno1.id,
        materia_id: materia1.id,
        maestro_id: maestro.id,
        nota: 8.5
      });

      const response = await request(app).get(`/maestros/${maestro.id}/grades`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Both students should be returned
      expect(response.body.find(s => s.studentId === alumno1.id)).toHaveProperty('currentGrade', 8.5);
      expect(response.body.find(s => s.studentId === alumno2.id)).toHaveProperty('currentGrade', null);
    });

    it('should filter students by group', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subjects
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas'
      });
      const materia2 = await Materia.create({
        codigo: 'MAT102',
        nombre: 'Álgebra'
      });

      // Create teacher-subject assignments
      await MateriaMaestro.create({
        materia_id: materia1.id,
        usuario_id: maestro.id,
        grupo: '1A'
      });
      await MateriaMaestro.create({
        materia_id: materia2.id,
        usuario_id: maestro.id,
        grupo: '1B'
      });

      // Create students
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });
      const alumno2 = await Alumno.create({
        nombre: 'Estudiante 2',
        email: 'est2@example.com',
        matricula: 'EST002',
        grupo: '1B'
      });

      const response = await request(app).get(`/maestros/${maestro.id}/grades?group=1A`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('group', '1A');
    });
  });

  describe('PUT /maestros/:id/grades', () => {
    it('should update existing grades', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subject for the teacher
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas',
        grupo: '1A',
        maestro_id: maestro.id
      });

      // Create student
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });

      // Create initial grade
      await Calificacion.create({
        alumno_id: alumno1.id,
        materia_id: materia1.id,
        maestro_id: maestro.id,
        nota: 7.0
      });

      const gradesUpdate = [
        {
          studentId: alumno1.id,
          subject: 'Matemáticas',
          newGrade: 9.0
        }
      ];

      const response = await request(app)
        .put(`/maestros/${maestro.id}/grades`)
        .send({ grades: gradesUpdate });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Calificaciones actualizadas');

      // Verify the grade was updated
      const updatedCalificacion = await Calificacion.findOne({
        where: {
          alumno_id: alumno1.id,
          materia_id: materia1.id,
          maestro_id: maestro.id
        }
      });
      expect(updatedCalificacion.nota).toBe(9.0);
    });

    it('should create new grades for students without existing grades', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const maestro = await Usuario.create({
        nombre: 'Profesor Juan',
        email: 'juan@example.com',
        password_hash: hashedPassword,
        rol: 'MAESTRO',
        matricula: 'MAT001'
      });

      // Create subject
      const materia1 = await Materia.create({
        codigo: 'MAT101',
        nombre: 'Matemáticas'
      });

      // Create teacher-subject assignment
      await MateriaMaestro.create({
        materia_id: materia1.id,
        usuario_id: maestro.id,
        grupo: '1A'
      });

      // Create student
      const alumno1 = await Alumno.create({
        nombre: 'Estudiante 1',
        email: 'est1@example.com',
        matricula: 'EST001',
        grupo: '1A'
      });

      const gradesUpdate = [
        {
          studentId: alumno1.id,
          subject: 'Matemáticas',
          newGrade: 8.5
        }
      ];

      const response = await request(app)
        .put(`/maestros/${maestro.id}/grades`)
        .send({ grades: gradesUpdate });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Calificaciones guardadas');

      // Verify the grade was created
      const newCalificacion = await Calificacion.findOne({
        where: {
          alumno_id: alumno1.id,
          materia_id: materia1.id,
          maestro_id: maestro.id
        }
      });
      expect(newCalificacion.nota).toBe(8.5);
    });
  });
});
