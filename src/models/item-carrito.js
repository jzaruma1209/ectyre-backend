"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ItemCarrito extends Model {
    static associate(models) {
      // Un item pertenece a un carrito
      this.belongsTo(models.Carrito, {
        foreignKey: "idCarrito",
        as: "carrito",
      });

      // Un item pertenece a un producto
      this.belongsTo(models.Producto, {
        foreignKey: "idProducto",
        as: "producto",
      });
    }
  }

  ItemCarrito.init(
    {
      idItem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_item",
      },
      idCarrito: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_carrito",
        references: {
          model: "carritos",
          key: "id_carrito",
        },
        onDelete: "CASCADE",
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_producto",
        references: {
          model: "productos",
          key: "id_producto",
        },
        onDelete: "RESTRICT",
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "precio_unitario",
        comment: "Precio al momento de agregar al carrito",
      },
    },
    {
      sequelize,
      modelName: "ItemCarrito",
      tableName: "items_carrito",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["id_carrito"],
        },
        {
          fields: ["id_producto"],
        },
      ],
    }
  );

  return ItemCarrito;
};
