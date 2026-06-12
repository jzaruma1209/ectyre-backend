"use strict";

const express = require("express");
const {
  uploadImagenLlanta,
  uploadImagenesLlanta,
  getImagenesLlanta,
  deleteImagen,
  setPrincipalImagen,
} = require("../controllers/imagen.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  uploadImagenLlanta: multerSingle,
  uploadImagenesLlanta: multerMultiple,
} = require("../middlewares/upload.middleware");

const router = express.Router();

// ─── Rutas de imágenes de llantas ────────────────────────────────────

// GET  /api/v1/admin/llantas/:id/imagenes         🌍 Público
// POST /api/v1/admin/llantas/:id/imagenes         👑 Admin — sube 1 imagen
router
  .route("/llantas/:id/imagenes")
  .get(getImagenesLlanta) // 🌍 Público
  .post(verifyJWT, multerSingle, uploadImagenLlanta); // 👑 Admin

// POST /api/v1/admin/llantas/:id/imagenes/multiple  👑 Admin — sube hasta 5 imágenes
router.post(
  "/llantas/:id/imagenes/multiple",
  verifyJWT,
  multerMultiple,
  uploadImagenesLlanta
); // 👑 Admin

// PATCH /api/v1/admin/llantas/:id/imagenes/:idImagen/principal  👑 Admin
router.patch(
  "/llantas/:id/imagenes/:idImagen/principal",
  verifyJWT,
  setPrincipalImagen
); // 👑 Admin

// DELETE /api/v1/admin/imagenes/:idImagen  👑 Admin
router.delete("/imagenes/:idImagen", verifyJWT, deleteImagen); // 👑 Admin

module.exports = router;
