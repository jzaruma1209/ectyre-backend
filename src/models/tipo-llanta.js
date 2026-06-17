"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TipoLlanta extends Model {
    static associate(models) {
      this.hasMany(models.Llanta, {
        foreignKey: "idTipoLlanta",
        as: "llantas",
      });
    }
  }

  TipoLlanta.init(
    {
      idTipoLlanta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_tipo_llanta",
      },
      codigo: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TipoLlanta",
      tableName: "tipos_llanta",
      timestamps: true,
      underscored: true,
    }
  );

  return TipoLlanta;
};
