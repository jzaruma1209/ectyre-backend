"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MetodoPago extends Model {
    static associate(models) {
      // Un método de pago tiene muchos pagos
      this.hasMany(models.Pago, {
        foreignKey: "idMetodoPago",
        as: "pagos",
      });
    }
  }

  MetodoPago.init(
    {
      idMetodo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_metodo",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: "Código interno (ej: TRANSFERENCIA, TARJETA, EFECTIVO)",
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Para desactivar métodos temporalmente",
      },
    },
    {
      sequelize,
      modelName: "MetodoPago",
      tableName: "metodos_pago",
      timestamps: true,
      underscored: true,
    }
  );

  return MetodoPago;
};
