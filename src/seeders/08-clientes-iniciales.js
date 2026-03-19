"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Admin2024#Llantas", 10);

    await queryInterface.bulkInsert("clientes", [
      {
        tipo_identificacion: "CEDULA",
        numero_identificacion: "0000000001",
        nombres: "Administrador",
        apellidos: "Sistema",
        email: "admin@llantas247.com",
        telefono: "0999000001",
        password_hash: passwordHash,
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
        password_hash: await bcrypt.hash("Test1234!", 10),
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
        password_hash: await bcrypt.hash("Test1234!", 10),
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
