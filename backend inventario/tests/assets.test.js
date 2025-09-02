const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

let token;
let agentId;

describe('Assets API', () => {
  beforeAll(async () => {
    // Limpiar tablas
    await sequelize.models.User.destroy({ where: {} });
    await sequelize.models.Agent.destroy({ where: {} });

    // Registrar usuario
    await request(app).post('/api/auth/register').send({
      name: 'Asset Tester',
      email: 'asset_tester@example.com',
      password: 'password123',
    });

    // Iniciar sesión para obtener token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'asset_tester@example.com',
      password: 'password123',
    });
    token = loginRes.body.token;

    // Crear un agente para usar en las pruebas de activos
    const agentRes = await request(app)
      .post('/api/agents')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Agent for Assets', department: 'Testing' });
    agentId = agentRes.body.id;
  });

  beforeEach(async () => {
    // Limpiar la tabla de activos antes de cada prueba
    await sequelize.models.Asset.destroy({ where: {} });
  });

  describe('POST /api/assets', () => {
    it('debería crear un nuevo activo exitosamente', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Laptop',
          description: 'A shiny new laptop',
          serialNumber: `SN-${Date.now()}`,
          value: 1500.50,
          purchaseDate: '2024-08-01',
          status: 'active',
          agentId: agentId,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('New Laptop');
      expect(res.body.agent.id).toBe(agentId);
    });

    it('debería devolver un error de validación si el agentId no existe', async () => {
      const res = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Laptop for Ghost',
          serialNumber: `SN-GHOST-${Date.now()}`,
          value: 100,
          purchaseDate: '2024-01-01',
          status: 'active',
          agentId: 9999, // ID de agente que no existe
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('El agente especificado no existe');
    });

    it('debería devolver un error de validación si faltan campos requeridos', async () => {
        const res = await request(app)
          .post('/api/assets')
          .set('Authorization', `Bearer ${token}`)
          .send({
            // Faltan name, serialNumber, value, etc.
            agentId: agentId,
          });
  
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('El nombre es requerido');
      });

      it('debería denegar la creación sin un token de autenticación', async () => {
        const res = await request(app)
          .post('/api/assets')
          .send({
            name: 'Unauthenticated Laptop',
            serialNumber: `SN-UNAUTH-${Date.now()}`,
            value: 200,
            purchaseDate: '2024-01-01',
            status: 'active',
            agentId: agentId,
          });
  
        expect(res.statusCode).toEqual(401);
      });
  });

  describe('GET /api/assets', () => {
    beforeEach(async () => {
      // Crear multiples activos para probar el listado y filtrado
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Laptop A', serialNumber: 'SN-A', value: 1, purchaseDate: '2024-01-01', status: 'active', agentId: agentId });
      
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Monitor B', serialNumber: 'SN-B', value: 2, purchaseDate: '2024-01-01', status: 'in_repair', agentId: agentId });
    });

    it('debería devolver una lista de todos los activos', async () => {
      const res = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });

    it('debería filtrar activos por estado (status)', async () => {
      const res = await request(app)
        .get('/api/assets?status=active')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe('active');
    });
  });

  describe('GET /api/assets/:id', () => {
    it('debería devolver un solo activo por su ID', async () => {
      const assetRes = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Asset', serialNumber: 'SN-SPECIFIC', value: 123, purchaseDate: '2024-01-01', status: 'active', agentId: agentId });
      const assetId = assetRes.body.id;

      const res = await request(app)
        .get(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toBe(assetId);
      expect(res.body.name).toBe('Specific Asset');
    });

    it('debería devolver 404 si el activo no existe', async () => {
      const res = await request(app)
        .get('/api/assets/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Activo no encontrado');
    });
  });

  describe('PUT /api/assets/:id', () => {
    it('debería actualizar un activo exitosamente', async () => {
      const assetRes = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Asset Name', serialNumber: 'SN-OLD', value: 1, purchaseDate: '2024-01-01', status: 'active', agentId: agentId });
      const assetId = assetRes.body.id;

      const res = await request(app)
        .put(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Asset Name', status: 'active' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Asset Name');
      expect(res.body.status).toBe('active');
    });

    it('debería devolver 404 si el activo a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/assets/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Valid Name', status: 'active', serialNumber: 'SN-VALID', value: 1, purchaseDate: '2024-01-01' });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/assets/:id', () => {
    it('debería eliminar un activo exitosamente', async () => {
      const assetRes = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted', serialNumber: 'SN-DEL', value: 1, purchaseDate: '2024-01-01', status: 'active', agentId: agentId });
      const assetId = assetRes.body.id;

      const res = await request(app)
        .delete(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Activo eliminado exitosamente');

      // Verificar que el activo ya no existe
      const getRes = await request(app)
        .get(`/api/assets/${assetId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('debería devolver 404 si el activo a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/assets/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
