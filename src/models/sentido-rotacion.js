"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SentidoRotacion extends Model {
    static associate(models) {
      this.hasMany(models.Llanta, {
        foreignKey: "idSentidoRotacion",
        as: "llantas",
      });
    }
  }

  SentidoRotacion.init(
    {
      idSentidoRotacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_sentido_rotacion",
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "SentidoRotacion",
      tableName: "sentidos_rotacion",
      timestamps: true,
      underscored: true,
    }
  );

  return SentidoRotacion;
};
