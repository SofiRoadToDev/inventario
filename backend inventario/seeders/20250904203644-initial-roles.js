'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [{
      role_name: 'ELIM',
      description: 'Informatico',
      createdAt: new Date(),
      updatedAt: new Date()
      },
      {
        role_name: 'Director',
        description: 'Director',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_name: 'Profesor',
        description: 'Profesor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('roles', null, {});
  }
  
};
