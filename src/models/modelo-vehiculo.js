"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ModeloVehiculo extends Model {
    static associate(models) {
      // Un modelo pertenece a una marca de vehículo
      this.belongsTo(models.MarcaVehiculo, {
        foreignKey: "idMarcaVehiculo",
        as: "marca",
      });

      // Un modelo tiene muchas compatibilidades con llantas
      this.hasMany(models.Compatibilidad, {
        foreignKey: "idModelo",
        as: "compatibilidades",
      });
    }
  }

  ModeloVehiculo.init(
    {
      idModelo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_modelo",
      },
      idMarcaVehiculo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca_vehiculo",
        references: {
          model: "marcas_vehiculos",
          key: "id_marca_vehiculo",
        },
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tipoVehiculo: {
        type: DataTypes.ENUM(
          "SEDAN",
          "SUV",
          "PICKUP",
          "DEPORTIVO",
          "CAMIONETA",
          "VAN",
          "OTRO"
        ),
        allowNull: false,
        defaultValue: "SEDAN",
        field: "tipo_vehiculo",
      },
    },
    {
      sequelize,
      modelName: "ModeloVehiculo",
      tableName: "modelos_vehiculos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_marca_vehiculo"],
        },
        {
          fields: ["tipo_vehiculo"],
        },
      ],
    }
  );

  return ModeloVehiculo;
};
