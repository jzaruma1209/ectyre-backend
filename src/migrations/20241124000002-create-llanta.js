"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("llantas", {
      id_llanta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_marca: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "marcas_llantas",
          key: "id_marca",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      modelo: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      codigo_fabricante: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      ancho: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      perfil: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rin: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      procedencia: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      anio_fabricacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      precio_oferta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      destacado: {
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

    // Crear índices para búsqueda
    await queryInterface.addIndex("llantas", ["ancho", "perfil", "rin"], {
      name: "idx_medidas_llanta",
    });
    await queryInterface.addIndex("llantas", ["id_marca"]);
    await queryInterface.addIndex("llantas", ["activo"]);
    await queryInterface.addIndex("llantas", ["destacado"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("llantas");
  },
};
