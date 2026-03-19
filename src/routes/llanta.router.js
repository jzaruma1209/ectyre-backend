const express = require("express");
const {
  getAllLlantas,
  getLlantaById,
  buscarPorMedida,
  buscarPorVehiculo,
  createLlanta,
  updateLlanta,
  deleteLlanta,
} = require("../controllers/llanta.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  validateLlantaData,
  validateId,
} = require("../middlewares/validation.middleware");

const router = express.Router();

// Rutas públicas
router.get("/", getAllLlantas); // 🌍 Público
router.get("/buscar-medida", buscarPorMedida); // 🌍 Público
router.get("/buscar-vehiculo", buscarPorVehiculo); // 🌍 Público
router.get("/:id", validateId, getLlantaById); // 🌍 Público

// Rutas protegidas (Admin)
router.post("/", verifyJWT, validateLlantaData, createLlanta); // 🔒 Admin
router.put("/:id", verifyJWT, validateId, validateLlantaData, updateLlanta); // 🔒 Admin
router.delete("/:id", verifyJWT, validateId, deleteLlanta); // 🔒 Admin

module.exports = router;
