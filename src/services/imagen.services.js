"use strict";

const { ImagenProducto, Producto, sequelize } = require("../models");
const { NotFoundError, ValidationError } = require("../utils/customErrors");
const { deleteImage, eliminarArchivosSubidos } = require("../config/cloudinary");
const { MAX_IMAGENES_PRODUCTO } = require("../utils/productoConstantes");

class ImagenService {
  /**
   * Agrega fotos a un producto existente respetando las reglas:
   *  - máximo 5 por producto (regla 3)
   *  - siempre exactamente una principal (regla 4)
   * @param {number} idProducto
   * @param {Array} archivos  archivos subidos por multer (path = url, filename = public_id)
   * @param {boolean} comoPrincipal  marca la primera foto nueva como principal
   */
  async agregarImagenes(idProducto, archivos = [], { comoPrincipal = false } = {}) {
    try {
      if (archivos.length === 0) throw new ValidationError("No se enviaron imágenes");
      const producto = await Producto.findByPk(idProducto);
      if (!producto) throw new NotFoundError("Producto no encontrado");

      const creadas = await sequelize.transaction(async (transaction) => {
        const actuales = await ImagenProducto.findAll({ where: { idProducto }, transaction, lock: transaction.LOCK.UPDATE });
        if (actuales.length + archivos.length > MAX_IMAGENES_PRODUCTO) {
          throw new ValidationError(
            `Máximo ${MAX_IMAGENES_PRODUCTO} imágenes por producto. Ya tiene ${actuales.length}, puedes agregar ${Math.max(
              0,
              MAX_IMAGENES_PRODUCTO - actuales.length
            )}.`
          );
        }
        const sinPrincipal = !actuales.some((img) => img.tipoImagen === "PRINCIPAL");
        const marcarPrincipal = comoPrincipal || sinPrincipal;
        if (marcarPrincipal && !sinPrincipal) {
          await ImagenProducto.update(
            { tipoImagen: "DETALLE" },
            { where: { idProducto, tipoImagen: "PRINCIPAL" }, transaction }
          );
        }
        const siguienteOrden = actuales.reduce((max, img) => Math.max(max, img.orden + 1), 0);
        return ImagenProducto.bulkCreate(
          archivos.map((archivo, indice) => ({
            idProducto,
            urlImagen: archivo.path,
            publicId: archivo.filename || null,
            orden: siguienteOrden + indice,
            tipoImagen: marcarPrincipal && indice === 0 ? "PRINCIPAL" : "DETALLE",
          })),
          { transaction }
        );
      });
      return creadas;
    } catch (error) {
      await eliminarArchivosSubidos(archivos);
      throw error;
    }
  }

  async getImagenesByProducto(idProducto) {
    return ImagenProducto.findAll({
      where: { idProducto },
      order: [
        ["orden", "ASC"],
        ["idImagen", "ASC"],
      ],
    });
  }

  async deleteImagen(idImagen) {
    const imagen = await ImagenProducto.findByPk(idImagen);
    if (!imagen) throw new NotFoundError("Imagen no encontrada");

    await sequelize.transaction(async (transaction) => {
      await imagen.destroy({ transaction });
      // Regla 4: si se borró la principal, la siguiente por orden pasa a ser principal
      if (imagen.tipoImagen === "PRINCIPAL") {
        const siguiente = await ImagenProducto.findOne({
          where: { idProducto: imagen.idProducto },
          order: [
            ["orden", "ASC"],
            ["idImagen", "ASC"],
          ],
          transaction,
        });
        if (siguiente) await siguiente.update({ tipoImagen: "PRINCIPAL" }, { transaction });
      }
    });

    if (imagen.publicId) {
      await deleteImage(imagen.publicId).catch((error) =>
        console.warn(`[Cloudinary] No se pudo eliminar ${imagen.publicId}: ${error.message}`)
      );
    }
    return { message: "Imagen eliminada correctamente" };
  }

  async setPrincipal(idProducto, idImagen) {
    return sequelize.transaction(async (transaction) => {
      const imagen = await ImagenProducto.findByPk(idImagen, { transaction });
      if (!imagen || imagen.idProducto !== Number(idProducto)) {
        throw new NotFoundError("Imagen no encontrada para este producto");
      }
      await ImagenProducto.update(
        { tipoImagen: "DETALLE" },
        { where: { idProducto: imagen.idProducto, tipoImagen: "PRINCIPAL" }, transaction }
      );
      await imagen.update({ tipoImagen: "PRINCIPAL" }, { transaction });
      return imagen;
    });
  }
}

module.exports = new ImagenService();
