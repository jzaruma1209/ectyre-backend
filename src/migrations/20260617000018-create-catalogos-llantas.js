"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── modelos_llantas ───────────────────────────────────────────────────────
    await queryInterface.createTable("modelos_llantas", {
      id_modelo_llanta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_marca: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "marcas_llantas", key: "id_marca" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
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

    await queryInterface.addIndex("modelos_llantas", ["id_marca"]);
    await queryInterface.addConstraint("modelos_llantas", {
      fields: ["id_marca", "nombre"],
      type: "unique",
      name: "modelos_llantas_marca_nombre_key",
    });

    // ─── indices_carga ─────────────────────────────────────────────────────────
    await queryInterface.createTable("indices_carga", {
      id_indice_carga: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
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

    // ─── indices_velocidad ─────────────────────────────────────────────────────
    await queryInterface.createTable("indices_velocidad", {
      id_indice_velocidad: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(5),
        allowNull: false,
        unique: true,
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

    // ─── temperaturas ──────────────────────────────────────────────────────────
    await queryInterface.createTable("temperaturas", {
      id_temperatura: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(5),
        allowNull: false,
        unique: true,
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

    // ─── tipos_llanta ──────────────────────────────────────────────────────────
    await queryInterface.createTable("tipos_llanta", {
      id_tipo_llanta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      codigo: {
        type: Sequelize.STRING(5),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.STRING(150),
        allowNull: false,
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

    // ─── sentidos_rotacion ─────────────────────────────────────────────────────
    await queryInterface.createTable("sentidos_rotacion", {
      id_sentido_rotacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sentidos_rotacion");
    await queryInterface.dropTable("tipos_llanta");
    await queryInterface.dropTable("temperaturas");
    await queryInterface.dropTable("indices_velocidad");
    await queryInterface.dropTable("indices_carga");
    await queryInterface.dropTable("modelos_llantas");
  },
};
