"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IndiceVelocidad extends Model {
    static associate(models) {
      this.hasMany(models.Llanta, {
        foreignKey: "idIndiceVelocidad",
        as: "llantas",
      });
    }
  }

  IndiceVelocidad.init(
    {
      idIndiceVelocidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_indice_velocidad",
      },
      codigo: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "IndiceVelocidad",
      tableName: "indices_velocidad",
      timestamps: true,
      underscored: true,
    }
  );

  return IndiceVelocidad;
};
