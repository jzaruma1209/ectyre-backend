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
      ],
    }
  );

  return ImagenLlanta;
};
