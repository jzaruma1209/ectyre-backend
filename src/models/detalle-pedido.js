"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DetallePedido extends Model {
    static associate(models) {
      // Un detalle pertenece a un pedido
      this.belongsTo(models.Pedido, {
        foreignKey: "idPedido",
        as: "pedido",
      });

      // Un detalle pertenece a una llanta
      this.belongsTo(models.Llanta, {
        foreignKey: "idLlanta",
        as: "llanta",
      });
    }
  }

  DetallePedido.init(
    {
      idDetalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_detalle",
      },
      idPedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_pedido",
        references: {
          model: "pedidos",
          key: "id_pedido",
        },
        onDelete: "CASCADE",
      },
      idLlanta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_llanta",
        references: {
          model: "llantas",
          key: "id_llanta",
        },
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "precio_unitario",
        comment: "Precio al momento del pedido",
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "cantidad * precio_unitario",
      },
    },
    {
      sequelize,
      modelName: "DetallePedido",
      tableName: "detalle_pedido",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_pedido"],
        },
        {
          fields: ["id_llanta"],
        },
      ],
    }
  );

  return DetallePedido;
};
