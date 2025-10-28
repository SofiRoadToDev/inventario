require('dotenv/config'); // Carga las variables de .env

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './dev.sqlite', // DB para desarrollo
    logging: false,
  },
  test: {
    dialect: process.env.DB_DIALECT_TEST || 'sqlite',
    storage: process.env.DB_STORAGE_TEST || './test.sqlite', // DB para tests
    logging: false, // No mostrar logs de SQL durante los tests
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};