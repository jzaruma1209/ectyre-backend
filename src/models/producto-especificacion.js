"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  // Valor de una especificación técnica en un producto (ej: Tracción → "A")
  class ProductoEspecificacion extends Model {
    static associate(models) {
      this.belongsTo(models.Producto, {
        foreignKey: "idProducto",
        as: "producto",
      });
      this.belongsTo(models.EspecificacionTecnica, {
        foreignKey: "idEspecificacion",
        as: "especificacion",
      });
    }
  }

  ProductoEspecificacion.init(
    {
      idProductoEspecificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_producto_especificacion",
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_producto",
        references: { model: "productos", key: "id_producto" },
        onDelete: "CASCADE",
      },
      idEspecificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_especificacion",
        references: { model: "especificaciones_tecnicas", key: "id_especificacion" },
        onDelete: "RESTRICT",
      },
      valor: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProductoEspecificacion",
      tableName: "producto_especificaciones",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_producto", "id_especificacion"],
          name: "producto_especificaciones_unica",
        },
      ],
    }
  );

  return ProductoEspecificacion;
};
