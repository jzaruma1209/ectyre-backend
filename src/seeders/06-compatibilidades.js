"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. Obtener IDs de las llantas
    const llantas = await queryInterface.sequelize.query(
      "SELECT id_llanta, modelo, ancho, perfil, rin FROM llantas;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 2. Obtener IDs de los modelos de vehículos
    const modelos = await queryInterface.sequelize.query(
      "SELECT id_modelo, nombre FROM modelos_vehiculos;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Crear mapas para facilitar la búsqueda
    const llantaMap = {};
    llantas.forEach((l) => {
      const key = `${l.modelo} ${l.ancho}/${l.perfil}R${l.rin}`;
      llantaMap[key] = l.id_llanta;
    });

    const modeloMap = {};
    modelos.forEach((m) => {
      modeloMap[m.nombre] = m.id_modelo;
    });

    const compatibilidades = [
      // Toyota Corolla usa comúnmente 205/55R16 o 225/45R17
      {
        id_llanta: llantaMap["Pilot Sport 4 225/45R17"],
        id_modelo: modeloMap["Corolla"],
        anio_desde: 2018,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id_llanta: llantaMap["Energy Saver+ 205/55R16"],
        id_modelo: modeloMap["Corolla"],
        anio_desde: 2012,
        anio_hasta: 2017,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Toyota Hilux usa comúnmente 265/70R17 o 265/75R16
      {
        id_llanta: llantaMap["Dueler AT 265/70R17"],
        id_modelo: modeloMap["Hilux"],
        anio_desde: 2015,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id_llanta: llantaMap["Dynapro AT2 265/75R16"],
        id_modelo: modeloMap["Hilux"],
        anio_desde: 2005,
        anio_hasta: 2014,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Chevrolet D-Max similar a Hilux
      {
        id_llanta: llantaMap["Dueler AT 265/70R17"],
        id_modelo: modeloMap["D-Max"],
        anio_desde: 2014,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Kia Sportage usa comúnmente 225/60R17 o 215/55R17
      {
        id_llanta: llantaMap["Primacy 4 215/55R17"],
        id_modelo: modeloMap["Sportage"],
        anio_desde: 2016,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Volkswagen Golf usa 225/45R17
      {
        id_llanta: llantaMap["PremiumContact 6 225/45R17"],
        id_modelo: modeloMap["Golf"],
        anio_desde: 2014,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Hyundai Tucson
      {
        id_llanta: llantaMap["CrossContact ATR 235/65R17"],
        id_modelo: modeloMap["Tucson"],
        anio_desde: 2015,
        anio_hasta: null,
        es_original: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Filtrar nulos por si alguna llave no coincidió (aunque deberían coincidir con los seeders previos)
    const validCompatibilidades = compatibilidades.filter(c => c.id_llanta && c.id_modelo);

    await queryInterface.bulkInsert("compatibilidad", validCompatibilidades);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("compatibilidad", null, {});
  },
};
