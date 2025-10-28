const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');
const { getTestAuthToken, findRole } = require('./test-helper');

const { Agent, Asset, Role } = sequelize.models;

let token;
let testRole;
let testRole2;

describe('Agents API', () => {
  // Se ejecuta una vez antes de todas las pruebas en este archivo.
  beforeAll(async () => {
    token = await getTestAuthToken();
    // Limpiamos las tablas para asegurar un estado inicial limpio.
    await Asset.destroy({ truncate: true, cascade: true });
    await Agent.destroy({ truncate: true, cascade: true });

    // Creamos los roles necesarios para las pruebas.
    testRole = await findRole('User');
    testRole2 = await findRole('Admin');
  });

  it('debería denegar el acceso sin un token', async () => {
    const res = await request(app).get('/api/agents');
    expect(res.statusCode).toEqual(401);
  });

  // Se ejecuta después de cada prueba para limpiar los datos creados.
  afterEach(async () => {
    await Asset.destroy({ truncate: true, cascade: true });
    await Agent.destroy({ truncate: true, cascade: true });
  });

  describe('POST /api/agents', () => {
    it('debería crear un nuevo agente exitosamente', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John', lastname: 'Doe', roleId: testRole.id });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John');
      expect(res.body).toHaveProperty('role');
      expect(res.body.role.id).toBe(testRole.id);
      expect(res.body.role.name).toBe('User');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ lastname: 'Doe', roleId: testRole.id });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería devolver un error de validación si falta el lastname', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John', roleId: testRole.id });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El apellido es requerido');
    });

    it('debería devolver un error si el roleId no existe', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Invalid', lastname: 'Role', roleId: 9999 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('El rol especificado no existe');
    });
  });

  describe('GET /api/agents', () => {
    it('debería devolver una lista de agentes', async () => {
      // Arrange: Crear datos de prueba directamente en la BD.
      await Agent.create({ name: 'Jane', lastname: 'Doe', roleId: testRole.id });

      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1); // Aserción exacta gracias al aislamiento.
      expect(res.body[0].name).toBe('Jane');
      expect(res.body[0]).toHaveProperty('role');
    });
  });

  describe('GET /api/agents/:id', () => {
    it('debería devolver un solo agente por su ID', async () => {
      const newAgent = await Agent.create({ name: 'Agent', lastname: '47', roleId: testRole.id });
      const agentId = newAgent.id;

      const res = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Agent');
      expect(res.body).toHaveProperty('role');
      expect(res.body.role.id).toBe(testRole.id);
    });

    it('debería devolver 404 si el agente no existe', async () => {
      const res = await request(app)
        .get('/api/agents/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Agente no encontrado');
    });
  });

  describe('PUT /api/agents/:id', () => {
    it('debería actualizar un agente exitosamente', async () => {
      const agent = await Agent.create({ name: 'Old', lastname: 'Name', roleId: testRole.id });
      const agentId = agent.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New', lastname: 'Name', roleId: testRole2.id });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New'); // El 'name' es 'New', 'lastname' es 'Name'
      expect(res.body.role.id).toBe(testRole2.id);
      expect(res.body.role.name).toBe('Admin');
    });

    it('debería devolver 404 si se intenta actualizar un agente que no existe', async () => {
      const res = await request(app)
        .put('/api/agents/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non', lastname: 'Existent' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const agent = await Agent.create({ name: 'Valid', lastname: 'Agent', roleId: testRole.id });
      const agentId = agent.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre no puede estar vacío');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('debería eliminar un agente exitosamente', async () => {
      const agent = await Agent.create({ name: 'To Be', lastname: 'Deleted', roleId: testRole.id });
      const agentId = agent.id;

      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      // TODO: Refactorizar el controlador para que devuelva 204. Temporalmente se espera 200.
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Agente eliminado exitosamente');
    });

    it('debería devolver 400 si se intenta eliminar un agente con activos', async () => {
      // --- Arrange: Crear entidades directamente en la BD ---
      // 1. Crear un agente
      const agent = await Agent.create({ name: 'Agent', lastname: 'With Asset', roleId: testRole.id });

      // 2. Crear un activo y asignarlo al agente
      await Asset.create({
        name: 'Test Laptop',
        serialNumber: `SN-${Date.now()}`,
        value: 1000,
        purchaseDate: '2024-01-01',
        status: 'BUENO',
        agentId: agent.id,
      });

      // --- Act & Assert ---
      const res = await request(app)
        .delete(`/api/agents/${agent.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar un agente con activos asignados');
    });
  });
});
