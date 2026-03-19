"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("direcciones", {
      id_direccion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      provincia: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      direccion_completa: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      referencia: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      es_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex("direcciones", ["id_cliente"]);
    await queryInterface.addIndex("direcciones", ["es_principal"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("direcciones");
  },
};
