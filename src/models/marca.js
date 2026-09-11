"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Marca extends Model {
    static associate(models) {
      // Una marca pertenece a un tipo de producto
      this.belongsTo(models.TipoProducto, {
        foreignKey: "idTipoProducto",
        as: "tipoProducto",
      });

      // Una marca tiene muchos modelos (solo si su tipo requiere modelo y medidas)
      this.hasMany(models.Modelo, {
        foreignKey: "idMarca",
        as: "modelos",
      });

      this.hasMany(models.Producto, {
        foreignKey: "idMarca",
        as: "productos",
      });
    }
  }

  Marca.init(
    {
      idMarca: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_marca",
      },
      idTipoProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_tipo_producto",
        references: {
          model: "tipos_producto",
          key: "id_tipo_producto",
        },
        onDelete: "RESTRICT",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
        comment: "Obligatorio si el tipo de producto requiere modelo y medidas (Llantas)",
      },
      bannerUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "banner_url",
        comment: "Obligatorio si el tipo de producto requiere modelo y medidas (Llantas)",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Marca",
      tableName: "marcas",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_tipo_producto", "nombre"],
          name: "marcas_tipo_nombre_key",
        },
      ],
    }
  );

  return Marca;
};
