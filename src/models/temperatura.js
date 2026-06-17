"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Temperatura extends Model {
    static associate(models) {
      this.hasMany(models.Llanta, {
        foreignKey: "idTemperatura",
        as: "llantas",
      });
    }
  }

  Temperatura.init(
    {
      idTemperatura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_temperatura",
      },
      codigo: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Temperatura",
      tableName: "temperaturas",
      timestamps: true,
      underscored: true,
    }
  );

  return Temperatura;
};
