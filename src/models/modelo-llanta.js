"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ModeloLlanta extends Model {
    static associate(models) {
      // Un modelo de llanta pertenece a una marca
      this.belongsTo(models.MarcaLlanta, {
        foreignKey: "idMarca",
        as: "marca",
      });

      // Un modelo de llanta tiene muchas llantas
      this.hasMany(models.Llanta, {
        foreignKey: "idModeloLlanta",
        as: "llantas",
      });
    }
  }

  ModeloLlanta.init(
    {
      idModeloLlanta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_modelo_llanta",
      },
      idMarca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca",
        references: {
          model: "marcas_llantas",
          key: "id_marca",
        },
        onDelete: "RESTRICT",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ModeloLlanta",
      tableName: "modelos_llantas",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_marca", "nombre"],
          name: "modelos_llantas_marca_nombre_key",
        },
        { fields: ["id_marca"] },
      ],
    }
  );

  return ModeloLlanta;
};
