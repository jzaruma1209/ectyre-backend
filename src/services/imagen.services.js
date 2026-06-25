"use strict";

const { ImagenProducto, Producto, sequelize } = require("../models");
const { NotFoundError } = require("../utils/customErrors");
const { deleteImage } = require("../config/cloudinary");

class ImagenService {
  async addImagenToProducto({ idProducto, urlImagen, publicId, formato, bytes, tipoImagen = "DETALLE", orden = 0 }) {
    try {
      const producto = await Producto.findByPk(idProducto);
      if (!producto) throw new NotFoundError("Producto no encontrado");

      const imagen = await ImagenProducto.create({
        idProducto,
        urlImagen,
        tipoImagen,
        orden,
      });

      return imagen;
    } catch (error) {
      throw new Error(`Error al agregar imagen: ${error.message}`);
    }
  }

  async getImagenesByProducto(idProducto) {
    try {
      const imagenes = await ImagenProducto.findAll({
        where: { idProducto },
        order: [["orden", "ASC"]],
      });
      return imagenes;
    } catch (error) {
      throw new Error(`Error al obtener imágenes: ${error.message}`);
    }
  }

  async deleteImagen(idImagen) {
    const transaction = await sequelize.transaction();
    try {
      const imagen = await ImagenProducto.findByPk(idImagen, { transaction });
      if (!imagen) throw new NotFoundError("Imagen no encontrada");

      await imagen.destroy({ transaction });

      await transaction.commit();
      return { message: "Imagen eliminada correctamente" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  }

  async setPrincipal(idProducto, idImagen) {
    const transaction = await sequelize.transaction();
    try {
      const producto = await Producto.findByPk(idProducto, { transaction });
      if (!producto) throw new NotFoundError("Producto no encontrada");

      const imagen = await ImagenProducto.findByPk(idImagen, { transaction });
      if (!imagen || imagen.idProducto !== parseInt(idProducto))
        throw new NotFoundError("Imagen no encontrada para este producto");

      await ImagenProducto.update(
        { tipoImagen: "DETALLE" },
        { where: { idProducto, tipoImagen: "PRINCIPAL" }, transaction }
      );

      await imagen.update({ tipoImagen: "PRINCIPAL" }, { transaction });

      await transaction.commit();
      return imagen;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cambiar imagen principal: ${error.message}`);
    }
  }

  async deleteAllImagenesByProducto(idProducto) {
    const transaction = await sequelize.transaction();
    try {
      const imagenes = await ImagenProducto.findAll({ where: { idProducto }, transaction });

      await ImagenProducto.destroy({ where: { idProducto }, transaction });

      await transaction.commit();
      return { message: `${imagenes.length} imagen(es) eliminada(s)` };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar imágenes del producto: ${error.message}`);
    }
  }
}

module.exports = new ImagenService();
