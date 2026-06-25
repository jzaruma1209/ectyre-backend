"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // NOTA: id_producto fue removido de llantas — la FK ahora vive en productos.id_llanta

    // Agregar id_modelo_llanta
    await queryInterface.addColumn("llantas", "id_modelo_llanta", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "modelos_llantas", key: "id_modelo_llanta" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar id_indice_carga
    await queryInterface.addColumn("llantas", "id_indice_carga", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "indices_carga", key: "id_indice_carga" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar id_indice_velocidad
    await queryInterface.addColumn("llantas", "id_indice_velocidad", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "indices_velocidad", key: "id_indice_velocidad" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar id_temperatura
    await queryInterface.addColumn("llantas", "id_temperatura", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "temperaturas", key: "id_temperatura" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar id_tipo_llanta
    await queryInterface.addColumn("llantas", "id_tipo_llanta", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "tipos_llanta", key: "id_tipo_llanta" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar id_sentido_rotacion
    await queryInterface.addColumn("llantas", "id_sentido_rotacion", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "sentidos_rotacion", key: "id_sentido_rotacion" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Agregar campos técnicos nuevos
    await queryInterface.addColumn("llantas", "treadwear", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("llantas", "presion_maxima", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("llantas", "lonas", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("llantas", "decibeles", {
      type: Sequelize.DECIMAL(4, 1),
      allowNull: true,
    });

    await queryInterface.addColumn("llantas", "dot", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    // Índice en id_modelo_llanta
    await queryInterface.addIndex("llantas", ["id_modelo_llanta"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("llantas", ["id_modelo_llanta"]);
    await queryInterface.removeColumn("llantas", "dot");
    await queryInterface.removeColumn("llantas", "decibeles");
    await queryInterface.removeColumn("llantas", "lonas");
    await queryInterface.removeColumn("llantas", "presion_maxima");
    await queryInterface.removeColumn("llantas", "treadwear");
    await queryInterface.removeColumn("llantas", "id_sentido_rotacion");
    await queryInterface.removeColumn("llantas", "id_tipo_llanta");
    await queryInterface.removeColumn("llantas", "id_temperatura");
    await queryInterface.removeColumn("llantas", "id_indice_velocidad");
    await queryInterface.removeColumn("llantas", "id_indice_carga");
    await queryInterface.removeColumn("llantas", "id_modelo_llanta");
  },
};
