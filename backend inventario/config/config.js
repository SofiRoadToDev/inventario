module.exports = () => {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

  const dbDialect = process.env.DB_DIALECT || 'sqlite';

  const configs = {
    development: {
      sqlite: {
        dialect: 'sqlite',
        storage: './inventario_db.sqlite'
      },
      postgres: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'inventario_db',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres'
      }
    },
    test: {
      sqlite: {
        dialect: 'sqlite',
        storage: './inventario_db_test.sqlite', // DB separada para tests
        logging: false
      },
      postgres: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME_TEST || 'inventario_test',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false
      }
    },
    production: {
      sqlite: {
        dialect: 'sqlite',
        storage: './inventario_db.sqlite' // No se recomienda usar SQLite en producción
      },
      postgres: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    }
  };

  return {
    development: configs.development[dbDialect],
    test: configs.test[dbDialect],
    production: configs.production[dbDialect]
  };
};
