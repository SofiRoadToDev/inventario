const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');
const { getTestAuthToken } = require('./test-helper');

let token;

describe('Roles API', () => {
  beforeEach(async () => {
    token = await getTestAuthToken();
  });

  it('debería denegar el acceso a /api/roles sin un token', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.statusCode).toEqual(401);
  });

  describe('POST /api/roles', () => {
    it('debería crear un nuevo rol exitosamente', async () => {
      const res = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Administrator' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Administrator');
    });

    it('debería devolver un error de validación si el nombre está vacío', async () => {
      const res = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('GET /api/roles', () => {
    it('debería devolver una lista de roles', async () => {
      // Los roles se crean en globalSetup.js
      // Por defecto: Admin, User

      const res = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('debería devolver un solo rol por su ID', async () => {
      const role = await sequelize.models.Role.findOne({ where: { name: 'User' } });

      const res = await request(app)
        .get(`/api/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('User');
    }, 10000);

    it('debería devolver 404 si el rol no existe', async () => {
      const res = await request(app)
        .get('/api/roles/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Rol no encontrado');
    });
  });

  describe('PUT /api/roles/:id', () => {
    it('debería actualizar un rol exitosamente', async () => {
      const role = await sequelize.models.Role.findOne({ where: { name: 'User' } });

      const res = await request(app)
        .put(`/api/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Name');
    });

    it('debería devolver 404 si el rol a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/roles/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent' });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('debería eliminar un rol exitosamente', async () => {
      const role = await sequelize.models.Role.create({ name: 'Deletable' });

      const res = await request(app)
        .delete(`/api/roles/${role.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Rol eliminado exitosamente');
    });

    it('debería devolver 404 si el rol a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/roles/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver 400 si se intenta eliminar un rol con agentes asignados', async () => {
      // 1. Crear un rol
      const roleWithAgent = await sequelize.models.Role.create({ name: 'Role In Use' });

      // 2. Crear un agente y asignarle el rol
      await sequelize.models.Agent.create({
        name: 'Test',
        lastname: 'Agent',
        roleId: roleWithAgent.id,
      });

      // 3. Intentar eliminar el rol
      const res = await request(app)
        .delete(`/api/roles/${roleWithAgent.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar un rol con agentes asignados');
    });
  });
});