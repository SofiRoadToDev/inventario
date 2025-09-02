const { sequelize } = require('../models');

beforeAll(async () => {
  // Sincroniza la base de datos de prueba, borrando todo lo anterior.
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Cierra la conexión a la base de datos al final de todas las pruebas.
  await sequelize.close();
});
