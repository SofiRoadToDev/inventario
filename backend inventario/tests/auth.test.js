const request = require('supertest');
const app = require('../server'); // Asegúrate de exportar tu app de Express
const { sequelize } = require('../models');

describe('Auth API', () => {
  // Limpiar la tabla de usuarios antes de cada prueba en este archivo
  beforeEach(async () => {
    await sequelize.models.User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Usuario creado exitosamente');
    });

    it('debería fallar si el email ya está en uso', async () => {
      // Crear un usuario primero
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      // Intentar registrar con el mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password456',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'El email ya está en uso');
    });

    it('debería fallar si faltan datos (ej. contraseña)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('La contraseña debe tener 6 o más caracteres');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear un usuario para poder hacer login
      await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('debería iniciar sesión y devolver un token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('debería fallar con credenciales incorrectas (contraseña errónea)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    it('debería fallar con un email que no existe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });
  });
});
