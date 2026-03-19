"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("compatibilidad", {
      id_compatibilidad: {
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
      id_modelo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "modelos_vehiculos",
          key: "id_modelo",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      anio_desde: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      anio_hasta: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      es_original: {
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

    await queryInterface.addIndex("compatibilidad", ["id_llanta"]);
    await queryInterface.addIndex("compatibilidad", ["id_modelo"]);
    await queryInterface.addIndex(
      "compatibilidad",
      ["id_llanta", "id_modelo", "anio_desde"],
      {
        unique: true,
        name: "idx_unique_compatibilidad",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("compatibilidad");
  },
};
