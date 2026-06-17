const express = require("express");
const {
  getLlantasByVehiculo,
  getVehiculosByLlanta,
  getCompatibilidadById,
  createCompatibilidad,
  updateCompatibilidad,
  deleteCompatibilidad,
} = require("../controllers/compatibilidad.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { validateId } = require("../middlewares/validation.middleware");

const routerCompatibilidad = express.Router();

// ─── Rutas públicas ─────────────────────────────────────────────────────────
routerCompatibilidad.get("/vehiculo", getLlantasByVehiculo);            // 🌍 Llantas por vehículo (?idModelo=1&anio=2020)
routerCompatibilidad.get("/llanta/:id", validateId, getVehiculosByLlanta); // 🌍 Vehículos por llanta
routerCompatibilidad.get("/:id", validateId, getCompatibilidadById);    // 🌍 Detalle de compatibilidad

// ─── Rutas protegidas (Admin) ────────────────────────────────────────────────
routerCompatibilidad.post("/", verifyJWT, createCompatibilidad);                       // 🔒 Crear compatibilidad
routerCompatibilidad.put("/:id", verifyJWT, validateId, updateCompatibilidad);         // 🔒 Actualizar compatibilidad
routerCompatibilidad.delete("/:id", verifyJWT, validateId, deleteCompatibilidad);      // 🔒 Eliminar compatibilidad

module.exports = routerCompatibilidad;
