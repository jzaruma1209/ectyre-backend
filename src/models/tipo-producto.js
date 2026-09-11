"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TipoProducto extends Model {
    static associate(models) {
      // Un tipo de producto agrupa marcas (ej: LLANTAS → Nankang, Davanti)
      this.hasMany(models.Marca, {
        foreignKey: "idTipoProducto",
        as: "marcas",
      });

      this.hasMany(models.Producto, {
        foreignKey: "idTipoProducto",
        as: "productos",
      });

      // Especificaciones técnicas que aplican a este tipo (ej: LLANTAS → Tracción)
      this.belongsToMany(models.EspecificacionTecnica, {
        through: models.EspecificacionTipoProducto,
        foreignKey: "idTipoProducto",
        otherKey: "idEspecificacion",
        as: "especificaciones",
      });
    }
  }

  TipoProducto.init(
    {
      idTipoProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_tipo_producto",
      },
      codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      requiereModeloMedidas: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "requiere_modelo_medidas",
        comment: "true → flujo A (Marca → Modelo → Ancho/Alto/Aro). false → flujo B (solo Marca)",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "TipoProducto",
      tableName: "tipos_producto",
      timestamps: true,
      underscored: true,
    }
  );

  return TipoProducto;
};
