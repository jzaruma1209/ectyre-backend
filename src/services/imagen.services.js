"use strict";

const { ImagenLlanta, Llanta, sequelize } = require("../models");
const { NotFoundError } = require("../utils/customErrors");
const { deleteImage } = require("../config/cloudinary");

class ImagenService {
  // ── Agregar imagen a una llanta ──────────────────────────────────────
  async addImagenToLlanta({ idLlanta, urlImagen, publicId, ancho, alto, formato, bytes, tipoImagen = "DETALLE", orden = 0 }) {
    try {
      // Verificar que la llanta existe
      const llanta = await Llanta.findByPk(idLlanta);
      if (!llanta) throw new NotFoundError("Llanta no encontrada");

      const imagen = await ImagenLlanta.create({
        idLlanta,
        urlImagen,
        publicId,
        ancho,
        alto,
        formato,
        bytes,
        tipoImagen,
        orden,
      });

      return imagen;
    } catch (error) {
      throw new Error(`Error al agregar imagen: ${error.message}`);
    }
  }

  // ── Obtener todas las imágenes de una llanta ─────────────────────────
  async getImagenesByLlanta(idLlanta) {
    try {
      const imagenes = await ImagenLlanta.findAll({
        where: { idLlanta },
        order: [["orden", "ASC"]],
      });
      return imagenes;
    } catch (error) {
      throw new Error(`Error al obtener imágenes: ${error.message}`);
    }
  }

  // ── Eliminar imagen por ID (también la borra de Cloudinary) ──────────
  async deleteImagen(idImagen) {
    const transaction = await sequelize.transaction();
    try {
      const imagen = await ImagenLlanta.findByPk(idImagen, { transaction });
      if (!imagen) throw new NotFoundError("Imagen no encontrada");

      const publicId = imagen.publicId; // Usamos el publicId guardado en DB

      await imagen.destroy({ transaction });

      // Si hay un publicId, borrarla de Cloudinary ANTES de commitear la transacción
      if (publicId) {
        await deleteImage(publicId);
      }

      await transaction.commit();
      return { message: "Imagen eliminada correctamente" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  }

  // ── Cambiar imagen principal de una llanta ───────────────────────────
  async setPrincipal(idLlanta, idImagen) {
    const transaction = await sequelize.transaction();
    try {
      const llanta = await Llanta.findByPk(idLlanta, { transaction });
      if (!llanta) throw new NotFoundError("Llanta no encontrada");

      const imagen = await ImagenLlanta.findByPk(idImagen, { transaction });
      if (!imagen || imagen.idLlanta !== idLlanta)
        throw new NotFoundError("Imagen no encontrada para esta llanta");

      // Quitar PRINCIPAL de las otras imágenes de esa llanta
      await ImagenLlanta.update(
        { tipoImagen: "DETALLE" },
        { where: { idLlanta, tipoImagen: "PRINCIPAL" }, transaction }
      );

      // Establecer esta como PRINCIPAL
      await imagen.update({ tipoImagen: "PRINCIPAL" }, { transaction });
      
      await transaction.commit();
      return imagen;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al cambiar imagen principal: ${error.message}`);
    }
  }

  // ── Eliminar TODAS las imágenes de una llanta (usado al borrar llanta) ─
  async deleteAllImagenesByLlanta(idLlanta) {
    const transaction = await sequelize.transaction();
    try {
      const imagenes = await ImagenLlanta.findAll({ where: { idLlanta }, transaction });

      // Borrar registros de DB
      await ImagenLlanta.destroy({ where: { idLlanta }, transaction });

      // Borrar cada imagen de Cloudinary
      await Promise.all(
        imagenes.map(async (img) => {
          if (img.publicId) {
            await deleteImage(img.publicId);
          }
        })
      );

      await transaction.commit();
      return { message: `${imagenes.length} imagen(es) eliminada(s)` };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al eliminar imágenes de la llanta: ${error.message}`);
    }
  }
}

module.exports = new ImagenService();
