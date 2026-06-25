"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      // Un producto pertenece a una llanta (FK id_llanta vive aquí en productos)
      this.belongsTo(models.Llanta, {
        foreignKey: "idLlanta",
        as: "llanta",
      });

      // Un producto tiene muchas imágenes
      this.hasMany(models.ImagenProducto, {
        foreignKey: "idProducto",
        as: "imagenes",
      });

      // Un producto puede estar en muchos items de carrito
      this.hasMany(models.ItemCarrito, {
        foreignKey: "idProducto",
        as: "itemsCarrito",
      });

      // Un producto puede estar en muchos detalles de pedido
      this.hasMany(models.DetallePedido, {
        foreignKey: "idProducto",
        as: "detallesPedidos",
      });

      // Un producto puede pertenecer a una imagen de promoción
      this.belongsTo(models.ImagenPromocion, {
        foreignKey: "idImagenPromocion",
        as: "imagenPromocion",
      });
    }
  }

  Producto.init(
    {
      idProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_producto",
      },
      tipoProducto: {
        type: DataTypes.ENUM("LLANTA"),
        allowNull: false,
        defaultValue: "LLANTA",
        field: "tipo_producto",
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      precioOferta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "precio_oferta",
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      destacado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Producto destacado en home",
      },
      idImagenPromocion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_imagen_promocion",
        references: {
          model: "imagenes_promocion",
          key: "id_imagen_promocion",
        },
      },
      idLlanta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_llanta",
        references: {
          model: "llantas",
          key: "id_llanta",
        },
        onDelete: "RESTRICT",
      },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "productos",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["activo"] },
        { fields: ["destacado"] },
        { fields: ["tipo_producto"] },
        { fields: ["id_llanta"] },
      ],
    }
  );

  return Producto;
};
