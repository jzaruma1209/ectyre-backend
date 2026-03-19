"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pedido extends Model {
    static associate(models) {
      // Un pedido pertenece a un cliente
      this.belongsTo(models.Cliente, {
        foreignKey: "idCliente",
        as: "cliente",
      });

      // Un pedido pertenece a una dirección de entrega
      this.belongsTo(models.Direccion, {
        foreignKey: "idDireccionEntrega",
        as: "direccionEntrega",
      });

      // Un pedido tiene muchos detalles
      this.hasMany(models.DetallePedido, {
        foreignKey: "idPedido",
        as: "detalles",
      });

      // Un pedido tiene muchos pagos
      this.hasMany(models.Pago, {
        foreignKey: "idPedido",
        as: "pagos",
      });
    }
  }

  Pedido.init(
    {
      idPedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_pedido",
      },
      numeroPedido: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "numero_pedido",
        comment: "Formato: P-YYYY-00001",
      },
      idCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_cliente",
        references: {
          model: "clientes",
          key: "id_cliente",
        },
      },
      idDireccionEntrega: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_direccion_entrega",
        references: {
          model: "direcciones",
          key: "id_direccion",
        },
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      iva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "IVA 15% en Ecuador",
      },
      costoEnvio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "costo_envio",
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM(
          "PENDIENTE",
          "CONFIRMADO",
          "EN_PREPARACION",
          "ENVIADO",
          "ENTREGADO",
          "CANCELADO"
        ),
        allowNull: false,
        defaultValue: "PENDIENTE",
      },
      requiereInstalacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "requiere_instalacion",
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Pedido",
      tableName: "pedidos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["numero_pedido"],
        },
        {
          fields: ["id_cliente"],
        },
        {
          fields: ["estado"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  return Pedido;
};
