const express = require("express");
const {
  getAllLlantas,
  getLlantaById,
  buscarPorMedida,
  buscarPorVehiculo,
  buscarGeneral,
  obtenerRecomendaciones,
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

// ── Rutas públicas ──────────────────────────────────────────
router.get("/", getAllLlantas);                          // 🌍 Catálogo general
router.get("/buscar-medida", buscarPorMedida);           // 🌍 Búsqueda por ancho/perfil/rin
router.get("/buscar-vehiculo", buscarPorVehiculo);       // 🌍 Búsqueda por vehículo
router.get("/buscar-general", buscarGeneral);            // 🌍 Búsqueda texto libre (barra de búsqueda + selector)
router.get("/recomendaciones", obtenerRecomendaciones);  // 🌍 Recomendaciones por rin
router.get("/:id", validateId, getLlantaById);          // 🌍 Detalle por ID

// ── Rutas protegidas (Admin) ────────────────────────────────
router.post("/", verifyJWT, validateLlantaData, createLlanta);
router.put("/:id", verifyJWT, validateId, validateLlantaData, updateLlanta);
router.delete("/:id", verifyJWT, validateId, deleteLlanta);

module.exports = router;
