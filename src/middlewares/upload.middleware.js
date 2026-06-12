"use strict";

const { uploadLlanta, uploadMarca } = require("../config/cloudinary");

/**
 * Middleware para subir UNA imagen de llanta
 * Usa el field name: "imagen"
 * Ej: POST /api/v1/admin/llantas con form-data key="imagen"
 */
const uploadImagenLlanta = (req, res, next) => {
  uploadLlanta.single("imagen")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error al subir la imagen",
      });
    }
    next();
  });
};

/**
 * Middleware para subir MÚLTIPLES imágenes de llanta (máx 5)
 * Usa el field name: "imagenes"
 */
const uploadImagenesLlanta = (req, res, next) => {
  uploadLlanta.array("imagenes", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error al subir las imágenes",
      });
    }
    next();
  });
};

/**
 * Middleware para subir logo de marca
 * Usa el field name: "logo"
 */
const uploadLogoMarca = (req, res, next) => {
  uploadMarca.single("logo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error al subir el logo",
      });
    }
    next();
  });
};

module.exports = {
  uploadImagenLlanta,
  uploadImagenesLlanta,
  uploadLogoMarca,
};
