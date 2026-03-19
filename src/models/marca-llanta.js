"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MarcaLlanta extends Model {
    static associate(models) {
      // Una marca tiene muchas llantas
      this.hasMany(models.Llanta, {
        foreignKey: "idMarca",
        as: "llantas",
      });
    }
  }

  MarcaLlanta.init(
    {
      idMarca: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_marca",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paisOrigen: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "pais_origen",
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "logo_url",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "MarcaLlanta",
      tableName: "marcas_llantas",
      timestamps: true,
      underscored: true,
    }
  );

  return MarcaLlanta;
};
