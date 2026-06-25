"use strict";

const express = require("express");
const {
  uploadImagenProducto,
  uploadImagenesProducto,
  getImagenesProducto,
  deleteImagen,
  setPrincipalImagen,
} = require("../controllers/imagen.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  uploadImagenLlanta: multerSingle,
  uploadImagenesLlanta: multerMultiple,
} = require("../middlewares/upload.middleware");

const router = express.Router();

// GET  /api/v1/admin/productos/:id/imagenes         🌍 Público
// POST /api/v1/admin/productos/:id/imagenes         👑 Admin — sube 1 imagen
router
  .route("/productos/:id/imagenes")
  .get(getImagenesProducto)
  .post(verifyJWT, multerSingle, uploadImagenProducto);

// POST /api/v1/admin/productos/:id/imagenes/multiple  👑 Admin — sube hasta 5 imágenes
router.post(
  "/productos/:id/imagenes/multiple",
  verifyJWT,
  multerMultiple,
  uploadImagenesProducto
);

// PATCH /api/v1/admin/productos/:id/imagenes/:idImagen/principal  👑 Admin
router.patch(
  "/productos/:id/imagenes/:idImagen/principal",
  verifyJWT,
  setPrincipalImagen
);

// DELETE /api/v1/admin/imagenes/:idImagen  👑 Admin
router.delete("/imagenes/:idImagen", verifyJWT, deleteImagen);

module.exports = router;
