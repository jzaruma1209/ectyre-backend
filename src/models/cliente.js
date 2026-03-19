"use strict";

const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      // Un cliente tiene muchas direcciones
      this.hasMany(models.Direccion, {
        foreignKey: "idCliente",
        as: "direcciones",
      });

      // Un cliente tiene muchos carritos
      this.hasMany(models.Carrito, {
        foreignKey: "idCliente",
        as: "carritos",
      });

      // Un cliente tiene muchos pedidos
      this.hasMany(models.Pedido, {
        foreignKey: "idCliente",
        as: "pedidos",
      });
    }

    // Método para comparar contraseñas
    async comparePassword(password) {
      return await bcrypt.compare(password, this.passwordHash);
    }
  }

  Cliente.init(
    {
      idCliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_cliente",
      },
      tipoIdentificacion: {
        type: DataTypes.ENUM("CEDULA", "RUC", "PASAPORTE"),
        allowNull: false,
        field: "tipo_identificacion",
      },
      numeroIdentificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: "numero_identificacion",
      },
      nombres: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      telefono: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Cliente",
      tableName: "clientes",
      timestamps: true,
      underscored: true,
      hooks: {
        // Encriptar contraseña antes de crear
        beforeCreate: async (cliente) => {
          if (cliente.passwordHash) {
            const salt = await bcrypt.genSalt(10);
            cliente.passwordHash = await bcrypt.hash(
              cliente.passwordHash,
              salt
            );
          }
        },
        // Encriptar contraseña antes de actualizar
        beforeUpdate: async (cliente) => {
          if (cliente.changed("passwordHash")) {
            const salt = await bcrypt.genSalt(10);
            cliente.passwordHash = await bcrypt.hash(
              cliente.passwordHash,
              salt
            );
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          unique: true,
          fields: ["numero_identificacion"],
        },
      ],
    }
  );

  return Cliente;
};
