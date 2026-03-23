"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("clientes", "role", {
      type: Sequelize.ENUM("cliente", "admin"),
      allowNull: false,
      defaultValue: "cliente",
    });

    // Asignar rol admin al usuario admin@ectyre.com
    await queryInterface.sequelize.query(
      `UPDATE clientes SET role = 'admin' WHERE email = 'admin@ectyre.com';`
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("clientes", "role");
    // Eliminar el ENUM type creado por PostgreSQL
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_clientes_role";`
    );
  },
};
