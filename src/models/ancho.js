"use strict";

const definirModeloMedida = require("../utils/definirModeloMedida");

// Catálogo de anchos disponibles (185, 195, 205…)
module.exports = (sequelize, DataTypes) =>
  definirModeloMedida(sequelize, DataTypes, {
    modelName: "Ancho",
    tableName: "anchos",
    primaryKey: "idAncho",
    field: "id_ancho",
  });
