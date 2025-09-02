const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

// Variable global para almacenar el token de autenticación
let token;

describe('Agents API', () => {
  // Antes de todas las pruebas de agentes, crear un usuario y obtener un token
  beforeAll(async () => {
    // Limpiar tablas relevantes
    await sequelize.models.User.destroy({ where: {} });

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
  });

  // Limpiar la tabla de agentes antes de cada prueba individual
  beforeEach(async () => {
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
        .send({ name: 'John Doe', department: 'Sales' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ department: 'Sales' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('GET /api/agents', () => {
    it('debería devolver una lista de agentes', async () => {
      // Crear un agente primero
      await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Doe', department: 'Marketing' });

      const res = await request(app)
        .get('/api/agents')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Jane Doe');
    });
  });

  describe('GET /api/agents/:id', () => {
    it('debería devolver un solo agente por su ID', async () => {
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent 47', department: 'Contracts' });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Agent 47');
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
        .send({ name: 'Old Name', department: 'Old Dept' });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name', department: 'New Dept' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Name');
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
        .send({ name: 'Valid Agent', department: 'Valid Dept' });
      const agentId = newAgentRes.body.id;

      const res = await request(app)
        .put(`/api/agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', department: 'Updated Dept' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('debería eliminar un agente exitosamente', async () => {
      const newAgentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted', department: 'Temp' });
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
        .send({ name: 'Agent With Asset', department: 'Finance' });
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
