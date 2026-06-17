"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Llanta extends Model {
    static associate(models) {
      // Una llanta pertenece a un producto (1:1)
      this.belongsTo(models.Producto, {
        foreignKey: "idProducto",
        as: "producto",
      });

      // Una llanta pertenece a una marca
      this.belongsTo(models.MarcaLlanta, {
        foreignKey: "idMarca",
        as: "marca",
      });

      // Una llanta pertenece a un modelo de llanta
      this.belongsTo(models.ModeloLlanta, {
        foreignKey: "idModeloLlanta",
        as: "modeloLlanta",
      });

      // Una llanta pertenece a un índice de carga
      this.belongsTo(models.IndiceCarga, {
        foreignKey: "idIndiceCarga",
        as: "indiceCarga",
      });

      // Una llanta pertenece a un índice de velocidad
      this.belongsTo(models.IndiceVelocidad, {
        foreignKey: "idIndiceVelocidad",
        as: "indiceVelocidad",
      });

      // Una llanta pertenece a una temperatura
      this.belongsTo(models.Temperatura, {
        foreignKey: "idTemperatura",
        as: "temperatura",
      });

      // Una llanta pertenece a un tipo de llanta
      this.belongsTo(models.TipoLlanta, {
        foreignKey: "idTipoLlanta",
        as: "tipoLlanta",
      });

      // Una llanta pertenece a un sentido de rotación
      this.belongsTo(models.SentidoRotacion, {
        foreignKey: "idSentidoRotacion",
        as: "sentidoRotacion",
      });

      // Una llanta tiene muchas compatibilidades con vehículos
      this.hasMany(models.Compatibilidad, {
        foreignKey: "idLlanta",
        as: "compatibilidades",
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
      idMarca: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_marca",
        references: {
          model: "marcas_llantas",
          key: "id_marca",
        },
        onDelete: "RESTRICT",
      },
      idModeloLlanta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_modelo_llanta",
        references: {
          model: "modelos_llantas",
          key: "id_modelo_llanta",
        },
        onDelete: "RESTRICT",
      },
      idIndiceCarga: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_indice_carga",
        references: {
          model: "indices_carga",
          key: "id_indice_carga",
        },
        onDelete: "RESTRICT",
      },
      idIndiceVelocidad: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_indice_velocidad",
        references: {
          model: "indices_velocidad",
          key: "id_indice_velocidad",
        },
        onDelete: "RESTRICT",
      },
      idTemperatura: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_temperatura",
        references: {
          model: "temperaturas",
          key: "id_temperatura",
        },
        onDelete: "RESTRICT",
      },
      idTipoLlanta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_tipo_llanta",
        references: {
          model: "tipos_llanta",
          key: "id_tipo_llanta",
        },
        onDelete: "RESTRICT",
      },
      idSentidoRotacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_sentido_rotacion",
        references: {
          model: "sentidos_rotacion",
          key: "id_sentido_rotacion",
        },
        onDelete: "RESTRICT",
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
      treadwear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Índice de desgaste UTQG",
      },
      presionMaxima: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: "presion_maxima",
        comment: "Presión máxima en PSI",
      },
      lonas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Número de lonas (capas de refuerzo)",
      },
      decibeles: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        comment: "Nivel de ruido en dB",
      },
      dot: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Código DOT de fabricación",
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
        { fields: ["id_marca"] },
        { fields: ["id_producto"] },
        { fields: ["id_modelo_llanta"] },
      ],
    }
  );

  return Llanta;
};
