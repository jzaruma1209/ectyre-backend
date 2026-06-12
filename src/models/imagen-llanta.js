"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ImagenLlanta extends Model {
    static associate(models) {
      // Una imagen pertenece a una llanta
      this.belongsTo(models.Llanta, {
        foreignKey: "idLlanta",
        as: "llanta",
      });
    }
  }

  ImagenLlanta.init(
    {
      idImagen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_imagen",
      },
      idLlanta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_llanta",
        references: {
          model: "llantas",
          key: "id_llanta",
        },
        onDelete: "CASCADE",
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
      ancho: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      alto: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      formato: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      bytes: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: "ImagenLlanta",
      tableName: "imagenes_llantas",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_llanta"],
        },
        {
          fields: ["tipo_imagen"],
        },
        {
          fields: ["public_id"],
        },
      ],
    }
  );

  return ImagenLlanta;
};
