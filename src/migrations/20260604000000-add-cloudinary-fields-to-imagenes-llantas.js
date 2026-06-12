"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "imagenes_llantas",
        "public_id",
        {
          type: Sequelize.STRING(255),
          allowNull: true, // true inicialmente para compatibilidad con las ya existentes
          comment: "ID único de la imagen en Cloudinary",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "imagenes_llantas",
        "ancho",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "Ancho de la imagen en píxeles",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "imagenes_llantas",
        "alto",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "Alto de la imagen en píxeles",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "imagenes_llantas",
        "formato",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "Formato de la imagen (ej: jpg, webp)",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "imagenes_llantas",
        "bytes",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "Tamaño de la imagen en bytes",
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("imagenes_llantas", "public_id", { transaction });
      await queryInterface.removeColumn("imagenes_llantas", "ancho", { transaction });
      await queryInterface.removeColumn("imagenes_llantas", "alto", { transaction });
      await queryInterface.removeColumn("imagenes_llantas", "formato", { transaction });
      await queryInterface.removeColumn("imagenes_llantas", "bytes", { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
