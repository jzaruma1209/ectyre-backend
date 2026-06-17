"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ImagenPromocion extends Model {
    static associate(models) {
      // Una imagen de promoción puede estar en muchos productos
      this.hasMany(models.Producto, {
        foreignKey: "idImagenPromocion",
        as: "productos",
      });
    }
  }

  ImagenPromocion.init(
    {
      idImagenPromocion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_imagen_promocion",
      },
      urlImagen: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "url_imagen",
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ImagenPromocion",
      tableName: "imagenes_promocion",
      timestamps: true,
      underscored: true,
    }
  );

  return ImagenPromocion;
};
