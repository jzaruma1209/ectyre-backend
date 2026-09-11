"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar columna id_tipo_llanta a marcas_llantas
    await queryInterface.addColumn("marcas_llantas", "id_tipo_llanta", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tipos_llanta",
        key: "id_tipo_llanta",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // 2. Asociar marcas existentes al primer tipo de llanta disponible
    const [tipos] = await queryInterface.sequelize.query(
      'SELECT id_tipo_llanta FROM tipos_llanta ORDER BY id_tipo_llanta ASC LIMIT 1;'
    );
    if (tipos && tipos.length > 0) {
      const defaultId = tipos[0].id_tipo_llanta;
      await queryInterface.sequelize.query(
        `UPDATE marcas_llantas SET id_tipo_llanta = ${defaultId} WHERE id_tipo_llanta IS NULL;`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("marcas_llantas", "id_tipo_llanta");
  },
};
