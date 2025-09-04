'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('sofi2025', 10); // Hash the password

    await queryInterface.bulkInsert('Users', [{
      name: 'sofi',
      email: 'sofi@gmail.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'sofi@gmail.com' }, {});
  }
};
