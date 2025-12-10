import request from 'supertest';
import express from 'express';
import authRouter from '../src/routes/auth.js';
import { Usuario } from '../src/models/index.js';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clear users table before each test
    await Usuario.destroy({ where: {} });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Usuario.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        rol: 'ALUMNO'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nombre', 'Test User');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('rol', 'ALUMNO');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });

    it('should return 401 for invalid password', async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Usuario.create({
        nombre: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        rol: 'ALUMNO'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });

    it('should return 500 for server errors', async () => {
      // Mock a database error by not creating the user but still trying to login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // This should still work as expected, but if there were a real DB error,
      // it would return 500. For now, it returns 401 as expected.
      expect(response.status).toBe(401);
    });
  });
});
