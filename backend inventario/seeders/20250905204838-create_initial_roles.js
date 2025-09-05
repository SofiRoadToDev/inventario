'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

     await queryInterface.bulkInsert('Roles', [{
        name: 'ELIM',
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name:'Director',
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        name:'Profesor',
        createdAt: new Date(),
        updatedAt: new Date()}
    ], {});
   
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
