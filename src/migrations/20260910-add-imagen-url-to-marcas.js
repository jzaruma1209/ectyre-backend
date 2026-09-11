'use strict';

// NOTA: por su nombre, esta migración se ordena ANTES de 20260910000021-create-product-catalogs
// (que crea la tabla `marcas`). En una base nueva la tabla aún no existe, por eso es defensiva.
// La migración 20260911000001-arquitectura-productos se encarga de las columnas finales de marcas.
const columnaExiste = async (queryInterface, tabla, columna) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = :tabla AND column_name = :columna`,
    { replacements: { tabla, columna } }
  );
  return rows.length > 0;
};

const tablaExiste = async (queryInterface, tabla) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT to_regclass(:nombre) AS reg`,
    { replacements: { nombre: `public.${tabla}` } }
  );
  return Boolean(rows[0].reg);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tablaExiste(queryInterface, 'marcas'))) return;
    if (await columnaExiste(queryInterface, 'marcas', 'imagen_url')) return;
    await queryInterface.addColumn('marcas', 'imagen_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    if (!(await tablaExiste(queryInterface, 'marcas'))) return;
    if (!(await columnaExiste(queryInterface, 'marcas', 'imagen_url'))) return;
    await queryInterface.removeColumn('marcas', 'imagen_url');
  },
};
