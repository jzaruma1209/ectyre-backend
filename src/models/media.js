"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MediaItem extends Model {
    static associate(models) {
      // Sin dependencias estrictas obligatorias, es un catálogo multimedia libre
    }
  }

  MediaItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      urlImagen: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "url_imagen",
      },
      publicId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "public_id",
      },
      bytes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      formato: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      dimensiones: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      seccion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "GENERAL",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "MediaItem",
      tableName: "media_items",
      timestamps: true,
      underscored: true,
    }
  );

  return MediaItem;
};
