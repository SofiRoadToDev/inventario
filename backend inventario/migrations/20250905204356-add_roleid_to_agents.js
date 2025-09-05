'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Agents', 'role', {
      type: Sequelize.INTEGER,
      allowNull: true,
    
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Agents', 'role');
  }
};