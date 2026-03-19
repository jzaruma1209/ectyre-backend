"use strict";

// Hashes pre-generados con bcrypt (salt=10) para evitar dependencia de bcrypt en runtime de npx
// Admin2026#Ectyre → $2b$10$KIp6e1P0xTqnQlrZ0sMyL.2sV3Jk5W3E4EsT7Qd5ZbFm1NpA8oVi
// Test1234!        → $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
//
// Para regenerar: node -e "require('bcrypt').hash('Admin2026#Ectyre',10).then(console.log)"
const HASH_ADMIN = "$2b$10$KIp6e1P0xTqnQlrZ0sMyL.2sV3Jk5W3E4EsT7Qd5ZbFm1NpA8oVi";
const HASH_TEST  = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("clientes", [
      {
        tipo_identificacion: "CEDULA",
        numero_identificacion: "0000000001",
        nombres: "Administrador",
        apellidos: "Sistema",
        email: "admin@ectyre.com",
        telefono: "0999000001",
        password_hash: HASH_ADMIN,
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
