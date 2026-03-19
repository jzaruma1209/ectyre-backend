"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("marcas_vehiculos", [
      { nombre: "Toyota", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Chevrolet", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Chevrolet_Gold_Bowtie_Racing.svg/1200px-Chevrolet_Gold_Bowtie_Racing.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Hyundai", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Kia", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/1200px-Kia-logo.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Mazda", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Mazda_logo.svg/1200px-Mazda_logo.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Ford", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/1200px-Ford_logo_flat.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Nissan", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Nissan_logo.svg/1200px-Nissan_logo.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
      { nombre: "Volkswagen", logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png", activo: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("marcas_vehiculos", null, {});
  },
};
