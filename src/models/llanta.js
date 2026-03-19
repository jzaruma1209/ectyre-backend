"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Llanta extends Model {
    static associate(models) {
      // Una llanta pertenece a una marca
      this.belongsTo(models.MarcaLlanta, {
        foreignKey: "idMarca",
        as: "marca",
      });

      // Una llanta tiene muchas imágenes
      this.hasMany(models.ImagenLlanta, {
        foreignKey: "idLlanta",
        as: "imagenes",
      });

      // Una llanta tiene muchas compatibilidades con vehículos
      this.hasMany(models.Compatibilidad, {
        foreignKey: "idLlanta",
        as: "compatibilidades",
      });

      // Una llanta puede estar en muchos items de carrito
      this.hasMany(models.ItemCarrito, {
        foreignKey: "idLlanta",
        as: "itemsCarrito",
      });

      // Una llanta puede estar en muchos detalles de pedido
      this.hasMany(models.DetallePedido, {
        foreignKey: "idLlanta",
        as: "detallesPedidos",
      });
    }
  }

  Llanta.init(
    {
      idLlanta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_llanta",
      },
      idMarca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca",
        references: {
          model: "marcas_llantas",
          key: "id_marca",
        },
      },
      modelo: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      codigoFabricante: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        field: "codigo_fabricante",
      },
      ancho: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Ancho en milímetros (ej: 205)",
      },
      perfil: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Perfil en porcentaje (ej: 55)",
      },
      rin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Tamaño de rin en pulgadas (ej: 16)",
      },
      procedencia: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "País de fabricación",
      },
      anioFabricacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "anio_fabricacion",
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
    },
    {
      sequelize,
      modelName: "Llanta",
      tableName: "llantas",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["ancho", "perfil", "rin"],
          name: "idx_medidas_llanta",
        },
        {
          fields: ["id_marca"],
        },
        {
          fields: ["activo"],
        },
        {
          fields: ["destacado"],
        },
      ],
    }
  );

  return Llanta;
};
