"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Compatibilidad extends Model {
    static associate(models) {
      // Una compatibilidad pertenece a una llanta
      this.belongsTo(models.Llanta, {
        foreignKey: "idLlanta",
        as: "llanta",
      });

      // Una compatibilidad pertenece a un modelo de vehículo
      this.belongsTo(models.ModeloVehiculo, {
        foreignKey: "idModelo",
        as: "modelo",
      });
    }
  }

  Compatibilidad.init(
    {
      idCompatibilidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_compatibilidad",
      },
      idLlanta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_llanta",
        references: {
          model: "llantas",
          key: "id_llanta",
        },
        onDelete: "CASCADE",
      },
      idModelo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_modelo",
        references: {
          model: "modelos_vehiculos",
          key: "id_modelo",
        },
        onDelete: "CASCADE",
      },
      anioDesde: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "anio_desde",
      },
      anioHasta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "anio_hasta",
        comment: "NULL significa actual",
      },
      esOriginal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "es_original",
        comment: "Indica si es medida original de fábrica",
      },
    },
    {
      sequelize,
      modelName: "Compatibilidad",
      tableName: "compatibilidad",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_llanta", "id_modelo", "anio_desde"],
          name: "idx_unique_compatibilidad",
        },
        {
          fields: ["id_llanta"],
        },
        {
          fields: ["id_modelo"],
        },
      ],
    }
  );

  return Compatibilidad;
};
