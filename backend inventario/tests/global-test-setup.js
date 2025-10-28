const { sequelize } = require('../models');

/**
 * Este hook se ejecuta antes de CADA ARCHIVO de test.
 * Su propósito es limpiar las tablas que se modifican durante las pruebas,
 * pero dejar intactos los datos "seed" (como usuarios y roles base)
 * que fueron creados en el globalSetup.
 */
beforeAll(async () => {
  // Lista de modelos para limpiar antes de cada suite de pruebas.
  // No incluimos User ni Role para mantener los datos del globalSetup.
  const modelsToClean = ['Asset', 'Agent', 'Category', 'Location', 'Nomenclature'];

  for (const modelName of modelsToClean) {
    if (sequelize.models[modelName]) {
      await sequelize.models[modelName].destroy({ where: {}, truncate: true, cascade: true });
    }
  }
});