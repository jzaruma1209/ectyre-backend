"use strict";

const express = require("express");
const { getAll, getById, create, update, remove, toggleActivo } = require("../controllers/promocion.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { uploadImagenPromocion: uploadPromocion } = require("../middlewares/upload.middleware");

const router = express.Router();

// Públicas
router.get("/", getAll);
router.get("/:id", getById);

// Protegidas (Admin)
router.post("/", verifyJWT, uploadPromocion, create);
router.put("/:id", verifyJWT, uploadPromocion, update);
router.delete("/:id", verifyJWT, remove);
router.patch("/:id/toggle", verifyJWT, toggleActivo);

module.exports = router;
