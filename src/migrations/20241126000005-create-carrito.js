"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carritos", {
      id_carrito: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sesion_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM("ACTIVO", "ABANDONADO", "CONVERTIDO"),
        allowNull: false,
        defaultValue: "ACTIVO",
      },
      fecha_abandonado: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("carritos", ["id_cliente"]);
    await queryInterface.addIndex("carritos", ["sesion_id"]);
    await queryInterface.addIndex("carritos", ["estado"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("carritos");
  },
};
