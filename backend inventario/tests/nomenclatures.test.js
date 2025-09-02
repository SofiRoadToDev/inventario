const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

let token;

describe('Nomenclatures API', () => {
  beforeAll(async () => {
    await sequelize.models.User.destroy({ where: {} });

    await request(app).post('/api/auth/register').send({
      name: 'Nomenclature Tester',
      email: 'nomenclature_tester@example.com',
      password: 'password123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'nomenclature_tester@example.com',
      password: 'password123',
    });
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    await sequelize.models.Nomenclature.destroy({ where: {} });
  });

  it('debería denegar el acceso sin un token', async () => {
    const res = await request(app).get('/api/nomenclatures');
    expect(res.statusCode).toEqual(401);
  });

  describe('POST /api/nomenclatures', () => {
    it('debería crear una nueva nomenclatura exitosamente', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Laptop', code: 'LT', type: 'General' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Laptop');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'LT', type: 'General' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería devolver un error de validación si falta el código', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Desktop', type: 'General' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El código es requerido');
    });

    it('debería denegar la creación sin un token de autenticación', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .send({ name: 'Unauthorized Nomenclature', code: 'UN', type: 'General' });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/nomenclatures', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nomenclature A', code: 'NA', type: 'General' });
      await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nomenclature B', code: 'NB', type: 'General' });
    });

    it('debería devolver una lista de nomenclaturas', async () => {
      const res = await request(app)
        .get('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /api/nomenclatures/:id', () => {
    it('debería devolver una sola nomenclatura por su ID', async () => {
      const newNomenclatureRes = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Nomenclature', code: 'SN', type: 'General' });
      const nomenclatureId = newNomenclatureRes.body.id;

      const res = await request(app)
        .get(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Specific Nomenclature');
    });

    it('debería devolver 404 si la nomenclatura no existe', async () => {
      const res = await request(app)
        .get('/api/nomenclatures/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Nomenclatura no encontrada');
    });
  });

  describe('PUT /api/nomenclatures/:id', () => {
    it('debería actualizar una nomenclatura exitosamente', async () => {
      const newNomenclatureRes = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Nomenclature Name', code: 'ON', type: 'General' });
      const nomenclatureId = newNomenclatureRes.body.id;

      const res = await request(app)
        .put(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Nomenclature Name', code: 'NN', type: 'General' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Nomenclature Name');
    });

    it('debería devolver 404 si la nomenclatura a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/nomenclatures/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent Nomenclature', code: 'NE', type: 'General' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const newNomenclatureRes = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Valid Nomenclature', code: 'VN', type: 'General' });
      const nomenclatureId = newNomenclatureRes.body.id;

      const res = await request(app)
        .put(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', code: 'VC', type: 'General' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('El nombre no puede estar vacío');
    });
  });

  describe('DELETE /api/nomenclatures/:id', () => {
    it('debería eliminar una nomenclatura exitosamente', async () => {
      const newNomenclatureRes = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted', code: 'TD', type: 'General' });
      const nomenclatureId = newNomenclatureRes.body.id;

      const res = await request(app)
        .delete(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Nomenclatura eliminada exitosamente');
    });

    it('debería devolver 404 si la nomenclatura a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/nomenclatures/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver 400 si se intenta eliminar una nomenclatura con activos asignados', async () => {
      // 1. Crear una nomenclatura
      const nomenclatureRes = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nomenclature With Asset', code: 'NWA', type: 'General' });
      const nomenclatureId = nomenclatureRes.body.id;

      // 2. Crear un agente (necesario para crear un activo)
      const agentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent for Nomenclature Test', department: 'Testing' });
      const agentId = agentRes.body.id;

      // 3. Crear un activo y asignarlo a la nomenclatura
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Asset for Nomenclature',
          serialNumber: `SN-NOM-${Date.now()}`,
          value: 100,
          purchaseDate: '2024-01-01',
          status: 'active',
          agentId: agentId,
          nomenclatureId: nomenclatureId,
        });

      // 4. Intentar eliminar la nomenclatura
      const res = await request(app)
        .delete(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar una nomenclatura con activos asignados');
    });
  });
});
