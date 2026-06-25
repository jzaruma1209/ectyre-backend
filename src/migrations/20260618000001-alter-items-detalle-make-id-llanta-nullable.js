"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hacer id_llanta nullable en items_carrito (ahora usamos id_producto)
    await queryInterface.changeColumn("items_carrito", "id_llanta", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Hacer id_llanta nullable en detalle_pedido (ahora usamos id_producto)
    await queryInterface.changeColumn("detalle_pedido", "id_llanta", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("items_carrito", "id_llanta", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn("detalle_pedido", "id_llanta", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
