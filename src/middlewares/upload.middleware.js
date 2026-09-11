"use strict";

const { uploadLlanta, uploadMarca, uploadProducto, uploadEspecificacion } = require("../config/cloudinary");
const { MAX_IMAGENES_PRODUCTO } = require("../utils/productoConstantes");

// Traduce los errores de multer a mensajes claros para el admin
const mensajeErrorMulter = (err, mensajePorDefecto) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE" && err.field === "imagenes") {
    return `Máximo ${MAX_IMAGENES_PRODUCTO} imágenes por producto`;
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return `Campo de archivo no permitido: ${err.field}`;
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return "La imagen supera el tamaño máximo permitido";
  }
  return err.message || mensajePorDefecto;
};

const manejarSubida = (middlewareMulter, mensajePorDefecto) => (req, res, next) => {
  middlewareMulter(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: mensajeErrorMulter(err, mensajePorDefecto),
      });
    }
    next();
  });
};

/**
 * Fotos del producto (field "imagenes", máx 5).
 * Si llega una sexta imagen, multer aborta la petición y elimina las ya subidas.
 * Ej: POST /api/v1/admin/productos (multipart: datos + imagenes[])
 */
const uploadImagenesProducto = manejarSubida(
  uploadProducto.array("imagenes", MAX_IMAGENES_PRODUCTO),
  "Error al subir las imágenes"
);

/**
 * UNA foto de producto (field "imagen") — endpoint individual de imágenes
 */
const uploadImagenProducto = manejarSubida(uploadProducto.single("imagen"), "Error al subir la imagen");

/**
 * Logo y banner de marca (fields "logo" y "banner")
 */
const uploadImagenesMarca = manejarSubida(
  uploadMarca.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  "Error al subir las imágenes de la marca"
);

/**
 * Ícono de especificación técnica (field "icono")
 */
const uploadIconoEspecificacion = manejarSubida(uploadEspecificacion.single("icono"), "Error al subir el ícono");

/**
 * Imagen de promoción / banner (field "imagen") — usado por /admin/promociones
 */
const uploadImagenPromocion = manejarSubida(uploadLlanta.single("imagen"), "Error al subir la imagen");

module.exports = {
  MAX_IMAGENES_PRODUCTO,
  uploadImagenesProducto,
  uploadImagenProducto,
  uploadImagenesMarca,
  uploadIconoEspecificacion,
  uploadImagenPromocion,
};
