"use strict";

const bcrypt = require("bcrypt");

// Contraseñas de prueba:
// Admin:   Admin2026#Ectyre
// Usuario: Test1234!

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const HASH_ADMIN = await bcrypt.hash("Admin2026#Ectyre", 10);
    const HASH_TEST = await bcrypt.hash("Test1234!", 10);

    await queryInterface.bulkInsert("clientes", [
      {
        tipo_identificacion: "CEDULA",
        numero_identificacion: "0000000001",
        nombres: "Administrador",
        apellidos: "Sistema",
        email: "admin@ectyre.com",
        telefono: "0999000001",
        password_hash: HASH_ADMIN,
        role: "admin",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        tipo_identificacion: "CEDULA",
        numero_identificacion: "1712345678",
        nombres: "Carlos",
        apellidos: "Mendoza",
        email: "carlos.mendoza@test.com",
        telefono: "0987654321",
        password_hash: HASH_TEST,
        role: "cliente",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        tipo_identificacion: "RUC",
        numero_identificacion: "1790012345001",
        nombres: "María Elena",
        apellidos: "Torres Vega",
        email: "maria.torres@test.com",
        telefono: "0991122334",
        password_hash: HASH_TEST,
        role: "cliente",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("clientes", null, {});
  },
};
