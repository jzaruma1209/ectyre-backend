"use strict";

const definirModeloMedida = require("../utils/definirModeloMedida");

// Catálogo de aros / rines disponibles (13, 14, 15, 22.5…)
module.exports = (sequelize, DataTypes) =>
  definirModeloMedida(sequelize, DataTypes, {
    modelName: "Aro",
    tableName: "aros",
    primaryKey: "idAro",
    field: "id_aro",
  });
