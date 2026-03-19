"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("modelos_vehiculos", {
      id_modelo: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_marca_vehiculo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "marcas_vehiculos",
          key: "id_marca_vehiculo",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tipo_vehiculo: {
        type: Sequelize.ENUM(
          "SEDAN",
          "SUV",
          "PICKUP",
          "DEPORTIVO",
          "CAMIONETA",
          "VAN",
          "OTRO"
        ),
        allowNull: false,
        defaultValue: "SEDAN",
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

    await queryInterface.addIndex("modelos_vehiculos", ["id_marca_vehiculo"]);
    await queryInterface.addIndex("modelos_vehiculos", ["tipo_vehiculo"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("modelos_vehiculos");
  },
};
