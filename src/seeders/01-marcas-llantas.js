"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("marcas_llantas", [
      {
        nombre: "Michelin",
        descripcion: "Líder mundial en neumáticos de alto rendimiento",
        pais_origen: "Francia",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Michelin_logo_svg.svg/1200px-Michelin_logo_svg.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Bridgestone",
        descripcion: "Fabricante japonés de neumáticos premium",
        pais_origen: "Japón",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Bridgestone_logo.svg/1200px-Bridgestone_logo.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Continental",
        descripcion: "Neumáticos alemanes de precisión",
        pais_origen: "Alemania",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Continental_AG_logo.svg/1200px-Continental_AG_logo.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Pirelli",
        descripcion: "Neumáticos italianos para alto rendimiento y deportivos",
        pais_origen: "Italia",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Pirelli_logo_2017.svg/1200px-Pirelli_logo_2017.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Goodyear",
        descripcion: "Neumáticos americanos de confianza",
        pais_origen: "Estados Unidos",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Goodyear_Tire_and_Rubber_Company_logo.svg/1200px-Goodyear_Tire_and_Rubber_Company_logo.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Hankook",
        descripcion: "Neumáticos coreanos con excelente relación precio-calidad",
        pais_origen: "Corea del Sur",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hankook_Tire_logo.svg/1200px-Hankook_Tire_logo.svg.png",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("marcas_llantas", null, {});
  },
};
