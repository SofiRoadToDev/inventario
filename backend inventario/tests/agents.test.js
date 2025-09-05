const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

// Variable global para almacenar el token de autenticación
let token;
// Variables globales para almacenar roles de prueba
let testRole;
let testRole2;

describe('Agents API', () => {
  // Antes de todas las pruebas de agentes, crear un usuario y obtener un token
  beforeAll(async () => {
    // Limpiar tablas relevantes
    await sequelize.models.User.destroy({ where: {} });
    await sequelize.models.Role.destroy({ where: {} });

    // Registrar un usuario de prueba
    await request(app).post('/api/auth/register').send({
      name: 'Agent Tester',
      email: 'agent_tester@example.com',
      password: 'password123',
    });

    // Iniciar sesión para obtener el token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'agent_tester@example.com',
      password: 'password123',
    });

    token = loginRes.body.token; // Guardar el token para usarlo en las pruebas

    // Crear roles de prueba para usar en los tests de agentes
    testRole = await sequelize.models.Role.create({ name: 'Tester' });
    testRole2 = await sequelize.models.Role.create({ name: 'Developer' });
  });

  // Limpiar la tabla de agentes antes de cada prueba individual
  beforeEach(async () => {
    await sequelize.models.Asset.destroy({ where: {} }); // Limpiar activos para el test de borrado
    await sequelize.models.Agent.destroy({ where: {} });
  });

  it('debería denegar el acceso sin un token', async () => {
    const res = await request(app).get('/api/agents');
    expect(res.statusCode).toEqual(401);
  });

  describe('POST /api/agents', () => {
    it('debería crear un nuevo agente exitosamente', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Doe', department: 'Sales', roleId: testRole.id });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body).toHaveProperty('role');
      expect(res.body.role.id).toBe(testRole.id);
      expect(res.body.role.name).toBe(testRole.name);
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ department: 'Sales', roleId: testRole.id });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería devolver un error de validación si falta el roleId', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Missing Role', department: 'HR' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El rol es requerido');
    });

    it('debería devolver un error si el roleId no existe', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Invalid Role', department: 'HR', roleId: 9999 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('El rol especificado no existe');
    });
  });

  describe('GET /api/agents', () => {
    it('debería devolver una lista de agentes', async () => {
      // Crear un agente primero
      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Doe', department: 'Marketing', roleId: testRole.id });

      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Jane Doe');
      expect(res.body[0]).toHaveProperty('role');
    });
  });

  describe('GET /api/agents/:id', () => {
    it('debería devolver un solo agente por su ID', async () => {
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent 47', department: 'Contracts', roleId: testRole.id });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Agent 47');
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
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name', department: 'Old Dept', roleId: testRole.id });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name', department: 'New Dept', roleId: testRole2.id });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.role.id).toBe(testRole2.id);
      expect(res.body.role.name).toBe('Developer');
    });

    it('debería devolver 404 si se intenta actualizar un agente que no existe', async () => {
      const res = await request(app)
        .put('/api/agents/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent', department: 'Ghost' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Valid Agent', department: 'Valid Dept', roleId: testRole.id });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', department: 'Updated Dept' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre no puede estar vacío');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('debería eliminar un agente exitosamente', async () => {
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted', department: 'Temp', roleId: testRole.id });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Agente eliminado exitosamente');
    });

    it('debería devolver 400 si se intenta eliminar un agente con activos', async () => {
      // 1. Crear un agente
      const agentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent With Asset', department: 'Finance', roleId: testRole.id });
      const agentId = agentRes.body.id;

      // 2. Crear un activo y asignarlo al agente
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Laptop',
          serialNumber: `SN-${Date.now()}`,
          value: 1000,
          purchaseDate: '2024-01-01',
          status: 'active',
          agentId: agentId,
        });

      // 3. Intentar eliminar el agente
      const res = await request(app)
        .delete(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar un agente con activos asignados');
    });
  });
});
