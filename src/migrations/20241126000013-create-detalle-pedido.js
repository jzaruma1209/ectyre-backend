"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("detalle_pedido", {
      id_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pedidos",
          key: "id_pedido",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_llanta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "llantas",
          key: "id_llanta",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

    await queryInterface.addIndex("detalle_pedido", ["id_pedido"]);
    await queryInterface.addIndex("detalle_pedido", ["id_llanta"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("detalle_pedido");
  },
};
