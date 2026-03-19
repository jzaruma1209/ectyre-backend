"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Direccion extends Model {
    static associate(models) {
      // Una dirección pertenece a un cliente
      this.belongsTo(models.Cliente, {
        foreignKey: "idCliente",
        as: "cliente",
      });

      // Una dirección puede estar en muchos pedidos
      this.hasMany(models.Pedido, {
        foreignKey: "idDireccionEntrega",
        as: "pedidos",
      });
    }
  }

  Direccion.init(
    {
      idDireccion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_direccion",
      },
      idCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_cliente",
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        onDelete: "CASCADE",
      },
      provincia: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ciudad: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      direccionCompleta: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "direccion_completa",
      },
      referencia: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Punto de referencia para ubicar",
      },
      esPrincipal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "es_principal",
        comment: "Dirección principal del cliente",
      },
    },
    {
      sequelize,
      modelName: "Direccion",
      tableName: "direcciones",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_cliente"],
        },
        {
          fields: ["es_principal"],
        },
      ],
    }
  );

  return Direccion;
};
