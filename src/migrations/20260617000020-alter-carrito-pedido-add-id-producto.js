"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar id_llanta → id_producto en items_carrito
    await queryInterface.addColumn("items_carrito", "id_producto", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "productos", key: "id_producto" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Cambiar id_llanta → id_producto en detalle_pedido
    await queryInterface.addColumn("detalle_pedido", "id_producto", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "productos", key: "id_producto" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Índices nuevos
    await queryInterface.addIndex("items_carrito", ["id_producto"]);
    await queryInterface.addIndex("detalle_pedido", ["id_producto"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("detalle_pedido", ["id_producto"]);
    await queryInterface.removeIndex("items_carrito", ["id_producto"]);
    await queryInterface.removeColumn("detalle_pedido", "id_producto");
    await queryInterface.removeColumn("items_carrito", "id_producto");
  },
};
