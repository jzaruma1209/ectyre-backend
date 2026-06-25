require("dotenv").config();
require("pg");
require("pg-hstore");

const useSSL = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("127.0.0.1") && !process.env.DATABASE_URL.includes("localhost");

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: useSSL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
    logging: false,
  },
  test: {
    use_env_variable: "DATABASE_URL_TEST",
    dialect: "postgres",
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};