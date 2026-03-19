"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pedidos", {
      id_pedido: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_pedido: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_direccion_entrega: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "direcciones",
          key: "id_direccion",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      iva: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      costo_envio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM(
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
      requiere_instalacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      fecha_estimada_entrega: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("pedidos", ["id_cliente"]);
    await queryInterface.addIndex("pedidos", ["numero_pedido"]);
    await queryInterface.addIndex("pedidos", ["estado"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pedidos");
  },
};
