"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      // Un pago pertenece a un pedido
      this.belongsTo(models.Pedido, {
        foreignKey: "idPedido",
        as: "pedido",
      });

      // Un pago pertenece a un método de pago
      this.belongsTo(models.MetodoPago, {
        foreignKey: "idMetodoPago",
        as: "metodoPago",
      });
    }
  }

  Pago.init(
    {
      idPago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_pago",
      },
      idPedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_pedido",
        references: {
          model: "pedidos",
          key: "id_pedido",
        },
      },
      idMetodoPago: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_metodo_pago",
        references: {
          model: "metodos_pago",
          key: "id_metodo",
        },
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estadoPago: {
        type: DataTypes.ENUM("PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"),
        allowNull: false,
        defaultValue: "PENDIENTE",
        field: "estado_pago",
      },
      comprobanteUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "comprobante_url",
        comment: "URL del comprobante subido por el cliente",
      },
      transaccionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "transaccion_id",
        comment: "ID de transacción de pasarela de pago",
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Pago",
      tableName: "pagos",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_pedido"],
        },
        {
          fields: ["estado_pago"],
        },
        {
          fields: ["transaccion_id"],
        },
      ],
    }
  );

  return Pago;
};
