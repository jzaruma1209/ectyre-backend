"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const llantas = await queryInterface.sequelize.query(
      "SELECT id_llanta, codigo_fabricante FROM llantas ORDER BY id_llanta;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const imagenes = [];
    llantas.forEach((llanta) => {
      // Cada llanta tendrá imagen PRINCIPAL + 2 adicionales (placeholder de Unsplash)
      imagenes.push({
        id_llanta: llanta.id_llanta,
        url_imagen: `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80`,
        tipo_imagen: "PRINCIPAL",
        orden: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      imagenes.push({
        id_llanta: llanta.id_llanta,
        url_imagen: `https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80`,
        tipo_imagen: "LATERAL",
        orden: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
      imagenes.push({
        id_llanta: llanta.id_llanta,
        url_imagen: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80`,
        tipo_imagen: "DETALLE",
        orden: 2,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    await queryInterface.bulkInsert("imagenes_llantas", imagenes);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("imagenes_llantas", null, {});
  },
};
