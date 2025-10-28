require('dotenv').config({ path: '.env.test' });
const { sequelize, User, Role } = require('../models');

module.exports = async () => {
  try {
    console.log('Running global setup...');
    // Sincronizar la base de datos de prueba
    await sequelize.sync({ force: true });
    console.log('Test database synchronized.');

    // Crear datos de prueba (seeds)
    // 1. Crear roles
    await Role.bulkCreate([
      { name: 'Admin' },
      { name: 'User' },
    ]);
    console.log('Test roles created.');

    // 2. Crear un usuario de prueba
    await User.create({
      name: 'Global Test User',
      email: 'test_user@example.com',
      password: 'password123',
    });
    console.log('Global test user created.');

  } catch (error) {
    console.error('Error in global setup:', error);
    process.exit(1);
  }
};