"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pagos", {
      id_pago: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pedidos",
          key: "id_pedido",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      id_metodo_pago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "metodos_pago",
          key: "id_metodo",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      estado_pago: {
        type: Sequelize.ENUM("PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"),
        allowNull: false,
        defaultValue: "PENDIENTE",
      },
      comprobante_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      transaccion_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("pagos", ["id_pedido"]);
    await queryInterface.addIndex("pagos", ["estado_pago"]);
    await queryInterface.addIndex("pagos", ["transaccion_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pagos");
  },
};
