"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ImagenProducto extends Model {
    static associate(models) {
      // Una imagen pertenece a un producto
      this.belongsTo(models.Producto, {
        foreignKey: "idProducto",
        as: "producto",
      });
    }
  }

  ImagenProducto.init(
    {
      idImagen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_imagen",
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_producto",
        references: {
          model: "productos",
          key: "id_producto",
        },
        onDelete: "CASCADE",
      },
      urlImagen: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "url_imagen",
      },
      tipoImagen: {
        type: DataTypes.ENUM("PRINCIPAL", "LATERAL", "DETALLE"),
        allowNull: false,
        defaultValue: "DETALLE",
        field: "tipo_imagen",
      },
      orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Orden de visualización",
      },
    },
    {
      sequelize,
      modelName: "ImagenProducto",
      tableName: "imagenes_productos",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["id_producto"] },
        { fields: ["tipo_imagen"] },
      ],
    }
  );

  return ImagenProducto;
};
