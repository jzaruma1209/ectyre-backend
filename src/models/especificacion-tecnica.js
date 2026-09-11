"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EspecificacionTecnica extends Model {
    static associate(models) {
      // Tipos de producto a los que aplica (ej: Voltaje → Baterías)
      this.belongsToMany(models.TipoProducto, {
        through: models.EspecificacionTipoProducto,
        foreignKey: "idEspecificacion",
        otherKey: "idTipoProducto",
        as: "tiposProducto",
      });

      // Valores asignados en cada producto
      this.hasMany(models.ProductoEspecificacion, {
        foreignKey: "idEspecificacion",
        as: "valores",
      });
    }
  }

  EspecificacionTecnica.init(
    {
      idEspecificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_especificacion",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      iconoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "icono_url",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "EspecificacionTecnica",
      tableName: "especificaciones_tecnicas",
      timestamps: true,
      underscored: true,
    }
  );

  return EspecificacionTecnica;
};
