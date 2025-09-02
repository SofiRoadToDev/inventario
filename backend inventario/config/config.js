require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const postgresDevelopment = {
  username: "postgres",
  password: "password",
  database: "inventario_db",
  host: "localhost",
  dialect: "postgres"
};

const postgresTest = {
  username: "postgres",
  password: "password",
  database: "inventario_test",
  host: "localhost",
  dialect: "postgres"
};

const postgresProduction = {
  use_env_variable: "DATABASE_URL",
  dialect: "postgres"
};

const sqliteConfig = {
  dialect: 'sqlite',
  storage: './inventario_db.sqlite'
};

const isSqlite = process.env.DB_DIALECT === 'sqlite';

module.exports = {
  development: isSqlite ? sqliteConfig : postgresDevelopment,
  test: isSqlite ? sqliteConfig : postgresTest,
  production: isSqlite ? sqliteConfig : postgresProduction
};