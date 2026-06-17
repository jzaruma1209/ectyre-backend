"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IndiceCarga extends Model {
    static associate(models) {
      this.hasMany(models.Llanta, {
        foreignKey: "idIndiceCarga",
        as: "llantas",
      });
    }
  }

  IndiceCarga.init(
    {
      idIndiceCarga: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_indice_carga",
      },
      codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "IndiceCarga",
      tableName: "indices_carga",
      timestamps: true,
      underscored: true,
    }
  );

  return IndiceCarga;
};
