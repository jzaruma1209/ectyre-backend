"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── imagenes_promocion ────────────────────────────────────────────────────
    await queryInterface.createTable("imagenes_promocion", {
      id_imagen_promocion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      url_imagen: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // ─── productos ─────────────────────────────────────────────────────────────
    await queryInterface.createTable("productos", {
      id_producto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      tipo_producto: {
        type: Sequelize.ENUM("LLANTA"),
        allowNull: false,
        defaultValue: "LLANTA",
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      precio_oferta: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      destacado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      id_imagen_promocion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "imagenes_promocion", key: "id_imagen_promocion" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    // ─── imagenes_productos ────────────────────────────────────────────────────
    await queryInterface.createTable("imagenes_productos", {
      id_imagen: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "productos", key: "id_producto" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      url_imagen: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      tipo_imagen: {
        type: Sequelize.ENUM("PRINCIPAL", "LATERAL", "DETALLE"),
        allowNull: false,
        defaultValue: "DETALLE",
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex("imagenes_productos", ["id_producto"]);
    await queryInterface.addIndex("imagenes_productos", ["tipo_imagen"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("imagenes_productos");
    await queryInterface.dropTable("productos");
    await queryInterface.dropTable("imagenes_promocion");
  },
};
