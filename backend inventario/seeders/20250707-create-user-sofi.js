'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('sofi.2025', 10); // Hash the password

    await queryInterface.bulkInsert('Users', [{
      name: 'sofi',
      email: 'sofia.rrii@gmail.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'sofia.rrii@gmail.com' }, {});
  }
};
