const { sequelize } = require("../models");

/**
 * Función para verificar la conexión a la base de datos
 * Se exporta como objeto { connection } para ser compatible con server.js
 */
const connection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = { connection };