"use strict";

const express = require("express");
const {
  uploadImagenProducto,
  uploadImagenesProducto,
  getImagenesProducto,
  deleteImagen,
  setPrincipalImagen,
} = require("../controllers/imagen.controllers");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const {
  uploadImagenProducto: multerSingle,
  uploadImagenesProducto: multerMultiple,
} = require("../middlewares/upload.middleware");

const router = express.Router();

// Montado en /api/v1/admin — todas requieren JWT + rol admin
// GET  /admin/productos/:id/imagenes            👑 Lista ordenada
// POST /admin/productos/:id/imagenes            👑 Sube 1 imagen (field "imagen")
router
  .route("/productos/:id/imagenes")
  .get(verifyJWT, isAdmin, getImagenesProducto)
  .post(verifyJWT, isAdmin, multerSingle, uploadImagenProducto);

// POST /admin/productos/:id/imagenes/multiple   👑 Sube varias (máx 5 en total por producto)
router.post("/productos/:id/imagenes/multiple", verifyJWT, isAdmin, multerMultiple, uploadImagenesProducto);

// PATCH /admin/productos/:id/imagenes/:idImagen/principal  👑
router.patch("/productos/:id/imagenes/:idImagen/principal", verifyJWT, isAdmin, setPrincipalImagen);

// DELETE /admin/imagenes/:idImagen  👑 (si era la principal, la siguiente pasa a serlo)
router.delete("/imagenes/:idImagen", verifyJWT, isAdmin, deleteImagen);

module.exports = router;
