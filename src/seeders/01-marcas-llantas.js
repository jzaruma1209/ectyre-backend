"use strict";

// Marcas iniciales del tipo de producto LLANTAS (tabla `marcas`).
// Idempotente: no duplica marcas que ya existan en ese tipo.
// Nota: las marcas de Llantas requieren logo y banner al editarse desde el admin.
const MARCAS = [
  {
    nombre: "Michelin",
    descripcion: "Líder mundial en neumáticos de alto rendimiento",
    pais_origen: "Francia",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Michelin_logo_svg.svg/1200px-Michelin_logo_svg.svg.png",
  },
  {
    nombre: "Bridgestone",
    descripcion: "Fabricante japonés de neumáticos premium",
    pais_origen: "Japón",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Bridgestone_logo.svg/1200px-Bridgestone_logo.svg.png",
  },
  {
    nombre: "Continental",
    descripcion: "Neumáticos alemanes de precisión",
    pais_origen: "Alemania",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Continental_AG_logo.svg/1200px-Continental_AG_logo.svg.png",
  },
  {
    nombre: "Pirelli",
    descripcion: "Neumáticos italianos para alto rendimiento y deportivos",
    pais_origen: "Italia",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Pirelli_logo_2017.svg/1200px-Pirelli_logo_2017.svg.png",
  },
  {
    nombre: "Goodyear",
    descripcion: "Neumáticos americanos de confianza",
    pais_origen: "Estados Unidos",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Goodyear_Tire_and_Rubber_Company_logo.svg/1200px-Goodyear_Tire_and_Rubber_Company_logo.svg.png",
  },
  {
    nombre: "Hankook",
    descripcion: "Neumáticos coreanos con excelente relación precio-calidad",
    pais_origen: "Corea del Sur",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Hankook_Tire_logo.svg/1200px-Hankook_Tire_logo.svg.png",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [tipos] = await queryInterface.sequelize.query(
      `SELECT id_tipo_producto FROM tipos_producto
       WHERE translate(upper(nombre), 'ÁÉÍÓÚ', 'AEIOU') = 'LLANTAS' LIMIT 1`
    );
    if (tipos.length === 0) return;
    const idTipoProducto = tipos[0].id_tipo_producto;

    for (const marca of MARCAS) {
      await queryInterface.sequelize.query(
        `INSERT INTO marcas (id_tipo_producto, nombre, descripcion, pais_origen, logo_url, activo, created_at, updated_at)
         VALUES (:idTipoProducto, :nombre, :descripcion, :pais, :logo, true, now(), now())
         ON CONFLICT (id_tipo_producto, nombre) DO NOTHING`,
        {
          replacements: {
            idTipoProducto,
            nombre: marca.nombre,
            descripcion: marca.descripcion,
            pais: marca.pais_origen,
            logo: marca.logo_url,
          },
        }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("marcas", { nombre: MARCAS.map((m) => m.nombre) }, {});
  },
};
