require("dotenv").config();
require("pg");
require("pg-hstore");

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
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
