"use strict";

const { Model } = require("sequelize");
const { formatearMedida } = require("../utils/formatoMedida");

module.exports = (sequelize, DataTypes) => {
  // Combinación Ancho + Alto + Aro de un producto. Solo existe si su tipo lo requiere.
  class ProductoMedida extends Model {
    static associate(models) {
      this.belongsTo(models.Producto, {
        foreignKey: "idProducto",
        as: "producto",
      });
      this.belongsTo(models.Ancho, {
        foreignKey: "idAncho",
        as: "ancho",
      });
      this.belongsTo(models.Alto, {
        foreignKey: "idAlto",
        as: "alto",
      });
      this.belongsTo(models.Aro, {
        foreignKey: "idAro",
        as: "aro",
      });
    }
  }

  ProductoMedida.init(
    {
      idProductoMedida: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_producto_medida",
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "id_producto",
        references: {
          model: "productos",
          key: "id_producto",
        },
        onDelete: "CASCADE",
      },
      idAncho: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_ancho",
        references: { model: "anchos", key: "id_ancho" },
        onDelete: "RESTRICT",
      },
      idAlto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_alto",
        references: { model: "altos", key: "id_alto" },
        onDelete: "RESTRICT",
      },
      idAro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_aro",
        references: { model: "aros", key: "id_aro" },
        onDelete: "RESTRICT",
      },
      // "225/75R15" — solo se calcula cuando ancho, alto y aro vienen incluidos
      texto: {
        type: DataTypes.VIRTUAL,
        get() {
          return formatearMedida(this.ancho?.valor, this.alto?.valor, this.aro?.valor);
        },
      },
    },
    {
      sequelize,
      modelName: "ProductoMedida",
      tableName: "producto_medidas",
      timestamps: true,
      underscored: true,
    }
  );

  return ProductoMedida;
};
