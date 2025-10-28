const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');
const { getTestAuthToken, findRole } = require('./test-helper');

let token;

describe('Locations API', () => {
  beforeEach(async () => {
    token = await getTestAuthToken();
  });

  it('debería denegar el acceso sin un token', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.statusCode).toEqual(401);
  });

  describe('POST /api/locations', () => {
    it('debería crear una nueva ubicación exitosamente', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Warehouse A', description: 'Main warehouse' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Warehouse A');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Some description' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería denegar la creación sin un token de autenticación', async () => {
      const res = await request(app)
        .post('/api/locations')
        .send({ name: 'Unauthorized Location' });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/locations', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Location A' });
      await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Location B' });
    });

    it('debería devolver una lista de ubicaciones', async () => {
      const res = await request(app)
        .get('/api/locations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/locations/:id', () => {
    it('debería devolver una sola ubicación por su ID', async () => {
      const newLocationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Location' });
      const locationId = newLocationRes.body.id;

      const res = await request(app)
        .get(`/api/locations/${locationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Specific Location');
    });

    it('debería devolver 404 si la ubicación no existe', async () => {
      const res = await request(app)
        .get('/api/locations/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Ubicación no encontrada');
    });
  });

  describe('PUT /api/locations/:id', () => {
    it('debería actualizar una ubicación exitosamente', async () => {
      const newLocationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Location Name' });
      const locationId = newLocationRes.body.id;

      const res = await request(app)
        .put(`/api/locations/${locationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Location Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Location Name');
    });

    it('debería devolver 404 si la ubicación a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/locations/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent Location' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const newLocationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Valid Location' });
      const locationId = newLocationRes.body.id;

      const res = await request(app)
        .put(`/api/locations/${locationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('DELETE /api/locations/:id', () => {
    it('debería eliminar una ubicación exitosamente', async () => {
      const newLocationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted' });
      const locationId = newLocationRes.body.id;

      const res = await request(app)
        .delete(`/api/locations/${locationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Ubicación eliminada exitosamente');
    });

    it('debería devolver 404 si la ubicación a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/locations/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver 400 si se intenta eliminar una ubicación con activos asignados', async () => {
      // 1. Crear una ubicación
      const locationRes = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Location With Asset' });
      const locationId = locationRes.body.id;

      // Crear el rol necesario para el agente
      const agentRole = await sequelize.models.Role.findOne({ where: { name: 'User' } });

      // 2. Crear un agente (necesario para crear un activo)
      const agentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent', lastname: 'for Location Test', roleId: agentRole.id });
      const agentId = agentRes.body.id;

      // 3. Crear un activo y asignarlo a la ubicación
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Asset for Location',
          serialNumber: `SN-LOC-${Date.now()}`,
          value: 100,
          purchaseDate: '2024-01-01',
          status: 'BUENO',
          agentId: agentId,
          locationId: locationId,
        });

      // 4. Intentar eliminar la ubicación
      const res = await request(app)
        .delete(`/api/locations/${locationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar una ubicación con activos asignados');
    });
  });
});
