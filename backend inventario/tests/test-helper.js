const request = require('supertest');
const app = require('../server');
const { Role } = require('../models');

let authToken;

/**
 * Inicia sesión con el usuario de prueba global y devuelve un token de autenticación.
 * Cachea el token para no tener que iniciar sesión repetidamente.
 */
const getTestAuthToken = async () => {
  if (authToken) {
    return authToken;
  }
  const response = await request(app).post('/api/auth/login').send({
    email: 'test_user@example.com',
    password: 'password123',
  });
  authToken = response.body.token;
  return authToken;
};

const findRole = async (name) => Role.findOne({ where: { name } });

module.exports = { getTestAuthToken, findRole };