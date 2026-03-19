"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Obtener IDs de los modelos de llantas
    const marcas = await queryInterface.sequelize.query(
      "SELECT id_marca, nombre FROM marcas_llantas ORDER BY id_marca;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const idMap = {};
    marcas.forEach((m) => { idMap[m.nombre] = m.id_marca; });

    const llantas = [
      // Michelin
      { id_marca: idMap["Michelin"], modelo: "Pilot Sport 4", codigo_fabricante: "PS4-22545R17", ancho: 225, perfil: 45, rin: 17, procedencia: "Francia", precio: 189.99, precio_oferta: 169.99, stock: 24, descripcion: "Llanta de alto rendimiento para vehículos deportivos. Excelente agarre en mojado y seco.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Michelin"], modelo: "Energy Saver+", codigo_fabricante: "ES-20555R16", ancho: 205, perfil: 55, rin: 16, procedencia: "Francia", precio: 145.00, precio_oferta: null, stock: 32, descripcion: "Llanta ecológica con bajo consumo de combustible. Ideal para sedanes y compactos.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Michelin"], modelo: "Primacy 4", codigo_fabricante: "P4-21555R17", ancho: 215, perfil: 55, rin: 17, procedencia: "España", precio: 162.50, precio_oferta: null, stock: 18, descripcion: "Llanta de turismo con máxima seguridad en frenado.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
      // Bridgestone
      { id_marca: idMap["Bridgestone"], modelo: "Turanza T005", codigo_fabricante: "TT005-20555R16", ancho: 205, perfil: 55, rin: 16, procedencia: "Japón", precio: 138.00, precio_oferta: 125.00, stock: 40, descripcion: "Llanta de turismo con excelente confort y seguridad en mojado.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Bridgestone"], modelo: "Dueler AT", codigo_fabricante: "DAT-26570R17", ancho: 265, perfil: 70, rin: 17, procedencia: "Japón", precio: 215.00, precio_oferta: null, stock: 15, descripcion: "Llanta todo terreno para pickup y SUV. Funciona en carretera y ofroad.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Bridgestone"], modelo: "Potenza RE003", codigo_fabricante: "PRE003-22545R18", ancho: 225, perfil: 45, rin: 18, procedencia: "Japón", precio: 198.00, precio_oferta: null, stock: 12, descripcion: "Llanta ultra performance para deportivos.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      // Continental
      { id_marca: idMap["Continental"], modelo: "PremiumContact 6", codigo_fabricante: "PC6-22545R17", ancho: 225, perfil: 45, rin: 17, procedencia: "Alemania", precio: 175.00, precio_oferta: 158.00, stock: 20, descripcion: "Llanta premium alemana con tecnología de última generación.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Continental"], modelo: "CrossContact ATR", codigo_fabricante: "CCATR-23565R17", ancho: 235, perfil: 65, rin: 17, procedencia: "Alemania", precio: 188.00, precio_oferta: null, stock: 22, descripcion: "Para SUV y crossovers, excelente en todo tipo de terreno.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      // Pirelli
      { id_marca: idMap["Pirelli"], modelo: "Cinturato P7", codigo_fabricante: "CP7-22550R17", ancho: 225, perfil: 50, rin: 17, procedencia: "Italia", precio: 165.00, precio_oferta: 149.00, stock: 28, descripcion: "Equilibrio perfecto entre rendimiento y eficiencia.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Pirelli"], modelo: "P Zero", codigo_fabricante: "PZ-24535R19", ancho: 245, perfil: 35, rin: 19, procedencia: "Italia", precio: 285.00, precio_oferta: null, stock: 8, descripcion: "El neumático deportivo de referencia para superdeportivos.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
      // Goodyear
      { id_marca: idMap["Goodyear"], modelo: "Assurance WeatherReady", codigo_fabricante: "AWR-21560R16", ancho: 215, perfil: 60, rin: 16, procedencia: "Estados Unidos", precio: 142.00, precio_oferta: null, stock: 35, descripcion: "Tracción confiable en toda condición climática.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      // Hankook
      { id_marca: idMap["Hankook"], modelo: "Ventus Prime3", codigo_fabricante: "VP3-20555R16", ancho: 205, perfil: 55, rin: 16, procedencia: "Corea del Sur", precio: 98.00, precio_oferta: 88.00, stock: 50, descripcion: "Excelente relación precio-calidad. Ideal para uso diario.", activo: true, destacado: false, created_at: new Date(), updated_at: new Date() },
      { id_marca: idMap["Hankook"], modelo: "Dynapro AT2", codigo_fabricante: "DA2-26575R16", ancho: 265, perfil: 75, rin: 16, procedencia: "Corea del Sur", precio: 145.00, precio_oferta: null, stock: 18, descripcion: "Todo terreno robusto para camionetas. Gran durabilidad.", activo: true, destacado: true, created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert("llantas", llantas);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("llantas", null, {});
  },
};
