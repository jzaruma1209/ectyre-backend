"use strict";

const { Model } = require("sequelize");

/**
 * Define un catálogo plano de medidas (anchos / altos / aros).
 * Las tres tablas son independientes entre sí y no dependen de marca ni modelo.
 * `valor` es DECIMAL para soportar aros como 22.5 y se devuelve como número.
 */
const definirModeloMedida = (sequelize, DataTypes, { modelName, tableName, primaryKey, field }) => {
  class Medida extends Model {
    static associate(models) {
      this.hasMany(models.ProductoMedida, {
        foreignKey: primaryKey,
        as: "productoMedidas",
      });
    }
  }

  Medida.init(
    {
      [primaryKey]: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field,
      },
      valor: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        unique: true,
        get() {
          const valor = this.getDataValue("valor");
          return valor === null || valor === undefined ? valor : Number(valor);
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName,
      tableName,
      timestamps: true,
      underscored: true,
    }
  );

  return Medida;
};

module.exports = definirModeloMedida;
