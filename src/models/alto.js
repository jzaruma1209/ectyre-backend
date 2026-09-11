"use strict";

const definirModeloMedida = require("../utils/definirModeloMedida");

// Catálogo de altos / perfiles disponibles (50, 60, 65…)
module.exports = (sequelize, DataTypes) =>
  definirModeloMedida(sequelize, DataTypes, {
    modelName: "Alto",
    tableName: "altos",
    primaryKey: "idAlto",
    field: "id_alto",
  });
