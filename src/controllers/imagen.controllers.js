"use strict";

const imagenService = require("../services/imagen.services");
const catchError = require("../utils/catchError");

const uploadImagenProducto = catchError(async (req, res) => {
  const idProducto = parseInt(req.params.id, 10);
  const archivos = req.file ? [req.file] : [];
  const [imagen] = await imagenService.agregarImagenes(idProducto, archivos, {
    comoPrincipal: req.body?.tipoImagen === "PRINCIPAL",
  });
  res.status(201).json({ success: true, message: "Imagen subida correctamente", data: imagen });
});

const uploadImagenesProducto = catchError(async (req, res) => {
  const idProducto = parseInt(req.params.id, 10);
  const imagenes = await imagenService.agregarImagenes(idProducto, req.files || []);
  res.status(201).json({
    success: true,
    message: `${imagenes.length} imagen(es) subida(s) correctamente`,
    data: imagenes,
  });
});

const getImagenesProducto = catchError(async (req, res) => {
  const imagenes = await imagenService.getImagenesByProducto(parseInt(req.params.id, 10));
  res.status(200).json({ success: true, message: "Imágenes obtenidas correctamente", data: imagenes });
});

const deleteImagen = catchError(async (req, res) => {
  const result = await imagenService.deleteImagen(parseInt(req.params.idImagen, 10));
  res.status(200).json({ success: true, message: result.message });
});

const setPrincipalImagen = catchError(async (req, res) => {
  const imagen = await imagenService.setPrincipal(parseInt(req.params.id, 10), parseInt(req.params.idImagen, 10));
  res.status(200).json({ success: true, message: "Imagen principal actualizada correctamente", data: imagen });
});

module.exports = {
  uploadImagenProducto,
  uploadImagenesProducto,
  getImagenesProducto,
  deleteImagen,
  setPrincipalImagen,
};
