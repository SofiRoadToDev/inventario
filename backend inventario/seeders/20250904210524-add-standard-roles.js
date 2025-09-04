'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        role_name: 'ELIM',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_name: 'Profesor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_name: 'Director',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_name: 'ViceDirector',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Esto eliminará solo los roles que se insertaron en este seeder
    await queryInterface.bulkDelete('roles', {
      role_name: ['ELIM', 'Profesor', 'Director', 'ViceDirector']
    }, {});
  }
};