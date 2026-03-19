"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Carrito extends Model {
    static associate(models) {
      // Un carrito pertenece a un cliente (puede ser null si es invitado)
      this.belongsTo(models.Cliente, {
        foreignKey: "idCliente",
        as: "cliente",
      });

      // Un carrito tiene muchos items
      this.hasMany(models.ItemCarrito, {
        foreignKey: "idCarrito",
        as: "items",
      });
    }
  }

  Carrito.init(
    {
      idCarrito: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_carrito",
      },
      idCliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_cliente",
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        onDelete: "CASCADE",
      },
      sesionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "sesion_id",
        comment: "Para carritos de invitados sin autenticar",
      },
      estado: {
        type: DataTypes.ENUM("ACTIVO", "ABANDONADO", "CONVERTIDO"),
        allowNull: false,
        defaultValue: "ACTIVO",
      },
      fechaAbandonado: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "fecha_abandonado",
      },
    },
    {
      sequelize,
      modelName: "Carrito",
      tableName: "carritos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_cliente"],
        },
        {
          fields: ["sesion_id"],
        },
        {
          fields: ["estado"],
        },
      ],
    }
  );

  return Carrito;
};
