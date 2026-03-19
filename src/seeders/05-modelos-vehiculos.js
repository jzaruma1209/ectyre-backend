"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const marcas = await queryInterface.sequelize.query(
      "SELECT id_marca, nombre FROM marcas_vehiculos ORDER BY id_marca;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const idMap = {};
    marcas.forEach((m) => { idMap[m.nombre] = m.id_marca; });

    await queryInterface.bulkInsert("modelos_vehiculos", [
      // Toyota
      { id_marca_vehiculo: idMap["Toyota"], nombre: "Corolla", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Toyota"], nombre: "Hilux", tipo_vehiculo: "PICKUP", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Toyota"], nombre: "RAV4", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Toyota"], nombre: "Yaris", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Toyota"], nombre: "Fortuner", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      // Chevrolet
      { id_marca_vehiculo: idMap["Chevrolet"], nombre: "Aveo", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Chevrolet"], nombre: "Captiva", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Chevrolet"], nombre: "D-Max", tipo_vehiculo: "PICKUP", created_at: new Date(), updated_at: new Date() },
      // Hyundai
      { id_marca_vehiculo: idMap["Hyundai"], nombre: "Tucson", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Hyundai"], nombre: "Accent", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Hyundai"], nombre: "Santa Fe", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      // Kia
      { id_marca_vehiculo: idMap["Kia"], nombre: "Sportage", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Kia"], nombre: "Rio", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      // Mazda
      { id_marca_vehiculo: idMap["Mazda"], nombre: "CX-5", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Mazda"], nombre: "Mazda3", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      // Ford
      { id_marca_vehiculo: idMap["Ford"], nombre: "Explorer", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Ford"], nombre: "Ranger", tipo_vehiculo: "PICKUP", created_at: new Date(), updated_at: new Date() },
      // Nissan
      { id_marca_vehiculo: idMap["Nissan"], nombre: "Frontier", tipo_vehiculo: "PICKUP", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Nissan"], nombre: "X-Trail", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
      // Volkswagen
      { id_marca_vehiculo: idMap["Volkswagen"], nombre: "Golf", tipo_vehiculo: "SEDAN", created_at: new Date(), updated_at: new Date() },
      { id_marca_vehiculo: idMap["Volkswagen"], nombre: "Tiguan", tipo_vehiculo: "SUV", created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("modelos_vehiculos", null, {});
  },
};
