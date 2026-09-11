"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  // Tabla puente: qué especificaciones técnicas aplican a qué tipos de producto
  class EspecificacionTipoProducto extends Model {}

  EspecificacionTipoProducto.init(
    {
      idEspecificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "id_especificacion",
        references: {
          model: "especificaciones_tecnicas",
          key: "id_especificacion",
        },
        onDelete: "CASCADE",
      },
      idTipoProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: "id_tipo_producto",
        references: {
          model: "tipos_producto",
          key: "id_tipo_producto",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "EspecificacionTipoProducto",
      tableName: "especificaciones_tipos_producto",
      timestamps: false,
      underscored: true,
    }
  );

  return EspecificacionTipoProducto;
};
