'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now obsolete as roleId is added in the main create-agents-table migration.
    return Promise.resolve();
  },
  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
