"use strict";

const imagenService = require("../services/imagen.services");
const catchError = require("../utils/catchError");

const uploadImagenProducto = catchError(async (req, res) => {
  const { id: idProducto } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No se envió ninguna imagen",
    });
  }

  const { tipoImagen = "DETALLE", orden = 0 } = req.body;

  const imagen = await imagenService.addImagenToProducto({
    idProducto: parseInt(idProducto),
    urlImagen: req.file.path,
    publicId: req.file.filename,
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

const uploadImagenesProducto = catchError(async (req, res) => {
  const { id: idProducto } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No se enviaron imágenes",
    });
  }

  const { tipoImagen = "DETALLE" } = req.body;

  const imagenes = await Promise.all(
    req.files.map((file, index) =>
      imagenService.addImagenToProducto({
        idProducto: parseInt(idProducto),
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

const getImagenesProducto = catchError(async (req, res) => {
  const { id: idProducto } = req.params;
  const imagenes = await imagenService.getImagenesByProducto(parseInt(idProducto));

  res.status(200).json({
    success: true,
    message: "Imágenes obtenidas correctamente",
    data: imagenes,
  });
});

const deleteImagen = catchError(async (req, res) => {
  const { idImagen } = req.params;
  const result = await imagenService.deleteImagen(parseInt(idImagen));

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const setPrincipalImagen = catchError(async (req, res) => {
  const { id: idProducto, idImagen } = req.params;
  const imagen = await imagenService.setPrincipal(
    parseInt(idProducto),
    parseInt(idImagen)
  );

  res.status(200).json({
    success: true,
    message: "Imagen principal actualizada correctamente",
    data: imagen,
  });
});

module.exports = {
  uploadImagenProducto,
  uploadImagenesProducto,
  getImagenesProducto,
  deleteImagen,
  setPrincipalImagen,
};
