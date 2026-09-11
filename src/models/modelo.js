"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Modelo extends Model {
    static associate(models) {
      // Un modelo pertenece SIEMPRE a una sola marca
      this.belongsTo(models.Marca, {
        foreignKey: "idMarca",
        as: "marca",
      });

      // Tipo de uso informativo (AT, MT, HP…) — no afecta la jerarquía
      this.belongsTo(models.TipoUso, {
        foreignKey: "idTipoUso",
        as: "tipoUso",
      });

      this.hasMany(models.Producto, {
        foreignKey: "idModelo",
        as: "productos",
      });
    }
  }

  Modelo.init(
    {
      idModelo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_modelo",
      },
      idMarca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca",
        references: {
          model: "marcas",
          key: "id_marca",
        },
        onDelete: "RESTRICT",
      },
      idTipoUso: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_tipo_uso",
        references: {
          model: "tipos_uso",
          key: "id_tipo_uso",
        },
        onDelete: "SET NULL",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Modelo",
      tableName: "modelos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["id_marca", "nombre"],
          name: "modelos_marca_nombre_key",
        },
        { fields: ["id_marca"] },
      ],
    }
  );

  return Modelo;
};
