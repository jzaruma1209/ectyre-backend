"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("items_carrito", {
      id_item: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "carritos",
          key: "id_carrito",
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
        defaultValue: 1,
      },
      precio_unitario: {
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

    await queryInterface.addIndex("items_carrito", ["id_carrito"]);
    await queryInterface.addIndex("items_carrito", ["id_llanta"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("items_carrito");
  },
};
