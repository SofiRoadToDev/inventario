const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models');
const { getTestAuthToken } = require('./test-helper');

let token;
const { Nomenclature, Asset, Agent, Role } = sequelize.models;

describe('Nomenclatures API', () => {
  // beforeEach se ejecuta antes de CADA prueba (it).
  // Esto garantiza un aislamiento perfecto entre pruebas.
  beforeEach(async () => {
    token = await getTestAuthToken();
    // Limpiamos todas las tablas que se modifican en esta suite de pruebas.
    // El orden es importante para evitar errores de clave foránea:
    // primero se eliminan los registros de las tablas que tienen dependencias.
    await Asset.destroy({ truncate: true, cascade: true });
    await Agent.destroy({ truncate: true, cascade: true });
    await Nomenclature.destroy({ truncate: true, cascade: true });
    // No es necesario limpiar Role, ya que se gestiona en el setup global
    // y las pruebas no deberían eliminar los roles base ('User', 'Admin').
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
        .send({ name: 'Laptop', code: 'LT' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Laptop');
    });

    it('debería devolver un error de validación si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'LT' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });

    it('debería devolver un error de validación si falta el código', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Desktop' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El código es requerido');
    });

    it('debería denegar la creación sin un token de autenticación', async () => {
      const res = await request(app)
        .post('/api/nomenclatures')
        .send({ name: 'Unauthorized Nomenclature', code: 'UN' });

      expect(res.statusCode).toEqual(401);
    });

    it('debería devolver un error si el código ya existe', async () => {
      // Arrange: Crear una nomenclatura inicial.
      await Nomenclature.create({ name: 'Laptop', code: 'LT' });

      // Act: Intentar crear otra nomenclatura con el mismo código.
      const res = await request(app)
        .post('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Laptop Model X', code: 'LT' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('El código ya está en uso');
    });
  });

  describe('GET /api/nomenclatures', () => {
    // Ya no necesitamos un beforeEach aquí, creamos los datos directamente en la prueba.
    it('debería devolver una lista de nomenclaturas', async () => {
      await Nomenclature.bulkCreate([
        { name: 'Nomenclature A', code: 'NA' },
        { name: 'Nomenclature B', code: 'NB' },
      ]);

      const res = await request(app)
        .get('/api/nomenclatures')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Ahora podemos hacer una aserción exacta porque controlamos el estado.
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/nomenclatures/:id', () => {
    it('debería devolver una sola nomenclatura por su ID', async () => {
      const newNomenclature = await Nomenclature.create({ name: 'Specific Nomenclature', code: 'SN' });
      const nomenclatureId = newNomenclature.id;

      const res = await request(app)
        .get(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Specific Nomenclature');
      expect(res.body.code).toBe('SN');
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
      const nomenclature = await Nomenclature.create({ name: 'Old Nomenclature Name', code: 'ON' });
      const nomenclatureId = nomenclature.id;
      const res = await request(app)
        .put(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Nomenclature Name', code: 'NN' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('New Nomenclature Name');
    });

    it('debería devolver 404 si la nomenclatura a actualizar no existe', async () => {
      const res = await request(app)
        .put('/api/nomenclatures/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Non Existent Nomenclature', code: 'NE' });

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver un error de validación al actualizar', async () => {
      const nomenclature = await Nomenclature.create({ name: 'Valid Nomenclature', code: 'VN' });
      const nomenclatureId = nomenclature.id;
      const res = await request(app)
        .put(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', code: 'VC' }); // Nombre inválido

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('El nombre es requerido');
    });
  });

  describe('DELETE /api/nomenclatures/:id', () => {
    it('debería eliminar una nomenclatura exitosamente', async () => {
      const nomenclature = await Nomenclature.create({ name: 'To Be Deleted', code: 'TD' });
      const nomenclatureId = nomenclature.id;
      const res = await request(app)
        .delete(`/api/nomenclatures/${nomenclatureId}`)
        .set('Authorization', `Bearer ${token}`);

      // Corregido: Las operaciones DELETE exitosas sin contenido deben devolver 204.
      expect(res.statusCode).toEqual(204);
    });

    it('debería devolver 404 si la nomenclatura a eliminar no existe', async () => {
      const res = await request(app)
        .delete('/api/nomenclatures/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
    });

    it('debería devolver 400 si se intenta eliminar una nomenclatura con activos asignados', async () => {
      // --- Arrange: Crear todas las entidades necesarias directamente en la BD ---
      // 1. Crear Rol, Agente y Nomenclatura
      const [agentRole] = await Role.findOrCreate({ where: { name: 'User' } });
      const agent = await Agent.create({
        name: 'Agent',
        lastname: 'for Nomenclature Test',
        roleId: agentRole.id
      });
      const nomenclature = await Nomenclature.create({
        name: 'Nomenclature With Asset',
        code: 'NWA'
      });

      // 2. Crear un Activo y asociarlo a la nomenclatura y al agente
      await Asset.create({
          name: 'Test Asset for Nomenclature',
          serialNumber: `SN-NOM-${Date.now()}`,
          value: 100,
          purchaseDate: '2024-01-01',
          status: 'BUENO',
          agentId: agent.id,
          nomenclatureId: nomenclature.id,
        });

      // 4. Intentar eliminar la nomenclatura
      const res = await request(app)
        .delete(`/api/nomenclatures/${nomenclature.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('No se puede eliminar una nomenclatura con activos asignados');
    });
  });
});
