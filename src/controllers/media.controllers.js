"use strict";

const mediaService = require("../services/media.services");
const catchError = require("../utils/catchError");

// GET /api/v1/admin/media
const getAllMedia = catchError(async (req, res) => {
  const { search } = req.query;
  const items = await mediaService.getAll({ search });
  res.json({
    success: true,
    message: "Medios obtenidos correctamente",
    data: items,
  });
});

// POST /api/v1/admin/media (1 archivo)
const uploadSingleMedia = catchError(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No se seleccionó ningún archivo de imagen",
    });
  }

  const item = await mediaService.createFromUpload(req.file, {
    nombre: req.body.nombre,
    seccion: req.body.seccion,
  });

  res.status(201).json({
    success: true,
    message: "Imagen subida exitosamente a Cloudinary",
    data: item,
  });
});

// POST /api/v1/admin/media/multiple (hasta 10 archivos)
const uploadMultipleMedia = catchError(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No se seleccionaron archivos de imagen",
    });
  }

  const items = await Promise.all(
    req.files.map((file) =>
      mediaService.createFromUpload(file, {
        seccion: req.body.seccion,
      })
    )
  );

  res.status(201).json({
    success: true,
    message: `${items.length} imágenes subidas exitosamente a Cloudinary`,
    data: items,
  });
});

// DELETE /api/v1/admin/media/:id
const deleteMediaItem = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await mediaService.delete(id);
  res.json({
    success: true,
    message: result.message,
    data: { id: parseInt(id) },
  });
});

module.exports = {
  getAllMedia,
  uploadSingleMedia,
  uploadMultipleMedia,
  deleteMediaItem,
};
