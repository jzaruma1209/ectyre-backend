"use strict";

const imagenService = require("../services/imagen.services");
const catchError = require("../utils/catchError");

// ─────────────────────────────────────────────────────────────────────
// IMÁGENES DE LLANTAS
// ─────────────────────────────────────────────────────────────────────

// Subir una imagen a una llanta (Admin)
// POST /api/v1/admin/llantas/:id/imagenes
const uploadImagenLlanta = catchError(async (req, res) => {
  const { id: idLlanta } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No se envió ninguna imagen",
    });
  }

  const { tipoImagen = "DETALLE", orden = 0 } = req.body;

  const imagen = await imagenService.addImagenToLlanta({
    idLlanta: parseInt(idLlanta),
    urlImagen: req.file.path,   // Cloudinary devuelve la URL segura
    publicId: req.file.filename, // multer-storage-cloudinary devuelve el public_id en filename
    bytes: req.file.size,
    formato: req.file.mimetype,
    tipoImagen,
    orden: parseInt(orden),
  });

  res.status(201).json({
    success: true,
    message: "Imagen subida correctamente",
    data: imagen,
  });
});

// Subir múltiples imágenes a una llanta (Admin)
// POST /api/v1/admin/llantas/:id/imagenes/multiple
const uploadImagenesLlanta = catchError(async (req, res) => {
  const { id: idLlanta } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No se enviaron imágenes",
    });
  }

  const { tipoImagen = "DETALLE" } = req.body;

  const imagenes = await Promise.all(
    req.files.map((file, index) =>
      imagenService.addImagenToLlanta({
        idLlanta: parseInt(idLlanta),
        urlImagen: file.path,
        publicId: file.filename,
        bytes: file.size,
        formato: file.mimetype,
        tipoImagen,
        orden: index,
      })
    )
  );

  res.status(201).json({
    success: true,
    message: `${imagenes.length} imagen(es) subida(s) correctamente`,
    data: imagenes,
  });
});

// Obtener todas las imágenes de una llanta (Público)
// GET /api/v1/admin/llantas/:id/imagenes
const getImagenesLlanta = catchError(async (req, res) => {
  const { id: idLlanta } = req.params;
  const imagenes = await imagenService.getImagenesByLlanta(parseInt(idLlanta));

  res.status(200).json({
    success: true,
    message: "Imágenes obtenidas correctamente",
    data: imagenes,
  });
});

// Eliminar una imagen específica (Admin)
// DELETE /api/v1/admin/imagenes/:idImagen
const deleteImagen = catchError(async (req, res) => {
  const { idImagen } = req.params;
  const result = await imagenService.deleteImagen(parseInt(idImagen));

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Establecer imagen como PRINCIPAL (Admin)
// PATCH /api/v1/admin/llantas/:id/imagenes/:idImagen/principal
const setPrincipalImagen = catchError(async (req, res) => {
  const { id: idLlanta, idImagen } = req.params;
  const imagen = await imagenService.setPrincipal(
    parseInt(idLlanta),
    parseInt(idImagen)
  );

  res.status(200).json({
    success: true,
    message: "Imagen principal actualizada correctamente",
    data: imagen,
  });
});

module.exports = {
  uploadImagenLlanta,
  uploadImagenesLlanta,
  getImagenesLlanta,
  deleteImagen,
  setPrincipalImagen,
};
