'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. FAMILIAS
    await queryInterface.createTable('familias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(10),
        unique: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('familias', ['codigo']);
    await queryInterface.addIndex('familias', ['activo']);

    // 2. MARCAS
    await queryInterface.createTable('marcas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(10),
        unique: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pais: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('marcas', ['codigo']);
    await queryInterface.addIndex('marcas', ['activo']);

    // 3. PROCEDENCIAS
    await queryInterface.createTable('procedencias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(10),
        unique: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('procedencias', ['codigo']);
    await queryInterface.addIndex('procedencias', ['activo']);

    // 4. LINEAS
    await queryInterface.createTable('lineas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      familia_id: {
        type: Sequelize.INTEGER,
        references: { model: 'familias', key: 'id' },
        allowNull: true,
        onDelete: 'SET NULL'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('lineas', ['codigo']);
    await queryInterface.addIndex('lineas', ['familia_id']);
    await queryInterface.addIndex('lineas', ['activo']);

    // 5. ACTUALIZAR PRODUCTOS - Agregar nuevas columnas
    await queryInterface.addColumn('productos', 'familia_id', {
      type: Sequelize.INTEGER,
      references: { model: 'familias', key: 'id' },
      allowNull: true,
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('productos', 'marca_id', {
      type: Sequelize.INTEGER,
      references: { model: 'marcas', key: 'id' },
      allowNull: true,
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('productos', 'procedencia_id', {
      type: Sequelize.INTEGER,
      references: { model: 'procedencias', key: 'id' },
      allowNull: true,
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('productos', 'linea_id', {
      type: Sequelize.INTEGER,
      references: { model: 'lineas', key: 'id' },
      allowNull: true,
      onDelete: 'RESTRICT'
    });

    await queryInterface.addIndex('productos', ['familia_id']);
    await queryInterface.addIndex('productos', ['marca_id']);
    await queryInterface.addIndex('productos', ['procedencia_id']);
    await queryInterface.addIndex('productos', ['linea_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('productos', 'linea_id');
    await queryInterface.removeColumn('productos', 'procedencia_id');
    await queryInterface.removeColumn('productos', 'marca_id');
    await queryInterface.removeColumn('productos', 'familia_id');

    await queryInterface.dropTable('lineas');
    await queryInterface.dropTable('procedencias');
    await queryInterface.dropTable('marcas');
    await queryInterface.dropTable('familias');
  }
};
