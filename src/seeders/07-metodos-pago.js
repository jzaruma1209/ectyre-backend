"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("metodos_pago", [
      {
        nombre: "Tarjeta de Crédito / Débito",
        codigo: "TARJETA",
        descripcion: "Pago con tarjeta Visa, Mastercard o American Express",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Transferencia Bancaria",
        codigo: "TRANSFERENCIA",
        descripcion: "Transferencia directa a nuestra cuenta bancaria. Adjuntar comprobante.",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Efectivo",
        codigo: "EFECTIVO",
        descripcion: "Pago en efectivo al momento de la entrega o instalación",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: "Depósito Bancario",
        codigo: "DEPOSITO",
        descripcion: "Depósito a nuestra cuenta bancaria. Adjuntar comprobante.",
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("metodos_pago", null, {});
  },
};
