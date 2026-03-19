"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("imagenes_llantas", {
      id_imagen: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_llanta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "llantas",
          key: "id_llanta",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      url_imagen: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      tipo_imagen: {
        type: Sequelize.ENUM("PRINCIPAL", "LATERAL", "DETALLE"),
        allowNull: false,
        defaultValue: "DETALLE",
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex("imagenes_llantas", ["id_llanta"]);
    await queryInterface.addIndex("imagenes_llantas", ["tipo_imagen"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("imagenes_llantas");
  },
};
