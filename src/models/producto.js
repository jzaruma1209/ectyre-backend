"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      // ─── Jerarquía: Tipo de producto → Marca → Modelo ──────────────────
      this.belongsTo(models.TipoProducto, {
        foreignKey: "idTipoProducto",
        as: "tipoProducto",
      });

      this.belongsTo(models.Marca, {
        foreignKey: "idMarca",
        as: "marca",
      });

      // Solo cuando el tipo de producto requiere modelo y medidas (ej: Llantas)
      this.belongsTo(models.Modelo, {
        foreignKey: "idModelo",
        as: "modelo",
      });

      // ─── Relaciones propias del producto ───────────────────────────────
      this.hasOne(models.ProductoMedida, {
        foreignKey: "idProducto",
        as: "medidas",
      });

      this.hasMany(models.ProductoEspecificacion, {
        foreignKey: "idProducto",
        as: "especificaciones",
      });

      // Máximo 5 imágenes, una principal
      this.hasMany(models.ImagenProducto, {
        foreignKey: "idProducto",
        as: "imagenes",
      });

      this.belongsTo(models.ImagenPromocion, {
        foreignKey: "idImagenPromocion",
        as: "imagenPromocion",
      });

      this.hasMany(models.Compatibilidad, {
        foreignKey: "idProducto",
        as: "compatibilidades",
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
      idTipoProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_tipo_producto",
        references: { model: "tipos_producto", key: "id_tipo_producto" },
        onDelete: "RESTRICT",
      },
      idMarca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca",
        references: { model: "marcas", key: "id_marca" },
        onDelete: "RESTRICT",
      },
      idModelo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_modelo",
        references: { model: "modelos", key: "id_modelo" },
        onDelete: "RESTRICT",
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Precio de venta actual (USD). Siempre > 0",
      },
      precioAnterior: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "precio_anterior",
        comment: "Precio tachado del card. Si existe debe ser > precio",
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      esNuevo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "es_nuevo",
      },
      enOferta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "en_oferta",
      },
      envioGratis: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "envio_gratis",
      },
      aplicaDevoluciones: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "aplica_devoluciones",
      },
      aplicaGarantia: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "aplica_garantia",
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
      // Stock en 0 no bloquea la creación, pero el card debe mostrar "Agotado"
      disponible: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("activo") !== false && Number(this.getDataValue("stock")) > 0;
        },
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
        { fields: ["id_tipo_producto"] },
        { fields: ["id_marca"] },
        { fields: ["id_modelo"] },
      ],
    }
  );

  return Producto;
};
