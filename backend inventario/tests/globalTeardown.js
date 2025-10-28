const { sequelize } = require('../models');

module.exports = async () => {
  try {
    console.log('Running global teardown...');
    await sequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error in global teardown:', error);
  }
};