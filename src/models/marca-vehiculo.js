"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MarcaVehiculo extends Model {
    static associate(models) {
      // Una marca de vehículo tiene muchos modelos
      this.hasMany(models.ModeloVehiculo, {
        foreignKey: "idMarcaVehiculo",
        as: "modelos",
      });
    }
  }

  MarcaVehiculo.init(
    {
      idMarcaVehiculo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_marca_vehiculo",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
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
      modelName: "MarcaVehiculo",
      tableName: "marcas_vehiculos",
      timestamps: true,
      underscored: true,
    }
  );

  return MarcaVehiculo;
};
