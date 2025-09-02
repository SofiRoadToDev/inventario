const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');

let token;

describe('Categories API', () => {
  beforeAll(async () => {
    await sequelize.models.User.destroy({ where: {} });

    await request(app).post('/api/auth/register').send({
      name: 'Category Tester',
      email: 'category_tester@example.com',
      password: 'password123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'category_tester@example.com',
      password: 'password123',
    });
    token = loginRes.body.token;
  });

  beforeEach(async () => {
    await sequelize.models.Category.destroy({ where: {} });
  });

  it('debería denegar el acceso sin un token', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(401);
  });

  describe('POST /api/categories', () => {
    it('debería crear una nueva categoría exitosamente', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Electronics' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Electronics');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería denegar la creación sin un token de autenticación', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'Unauthorized Category' });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Category A' });
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Category B' });
    });

    it('debería devolver una lista de categorías', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('debería devolver una sola categoría por su ID', async () => {
      const newCategoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Category' });
      const categoryId = newCategoryRes.body.id;

      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Specific Category');
    });

    it('debería devolver 404 si la categoría no existe', async () => {
      const res = await request(app)
        .get('/api/categories/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Categoría no encontrada');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('debería actualizar una categoría exitosamente', async () => {
      const newCategoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Category Name' });
      const categoryId = newCategoryRes.body.id;

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Category Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Category Name');
    });

    it('debería devolver 404 si la categoría a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/categories/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent Category' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const newCategoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Valid Category' });
      const categoryId = newCategoryRes.body.id;

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('debería eliminar una categoría exitosamente', async () => {
      const newCategoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Be Deleted' });
      const categoryId = newCategoryRes.body.id;

      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Categoría eliminada exitosamente');
    });

    it('debería devolver 404 si la categoría a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/categories/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver 400 si se intenta eliminar una categoría con activos asignados', async () => {
      // 1. Crear una categoría
      const categoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Category With Asset' });
      const categoryId = categoryRes.body.id;

      // 2. Crear un agente (necesario para crear un activo)
      const agentRes = await request(app)
        .post('/api/agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Agent for Category Test', department: 'Testing' });
      const agentId = agentRes.body.id;

      // 3. Crear un activo y asignarlo a la categoría
      await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Asset for Category',
          serialNumber: `SN-CAT-${Date.now()}`,
          value: 100,
          purchaseDate: '2024-01-01',
          status: 'active',
          agentId: agentId,
          categoryId: categoryId,
        });

      // 4. Intentar eliminar la categoría
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar una categoría con activos asignados');
    });
  });
});
