const express = require("express");
const {
  getProductosByVehiculo,
  getVehiculosByProducto,
  getCompatibilidadById,
  createCompatibilidad,
  updateCompatibilidad,
  deleteCompatibilidad,
} = require("../controllers/compatibilidad.controllers");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const { validateId, validateCompatibilidad } = require("../middlewares/validation.middleware");

const routerCompatibilidad = express.Router();

// ─── Rutas públicas ─────────────────────────────────────────────────────────
routerCompatibilidad.get("/vehiculo", getProductosByVehiculo);                  // 🌍 Productos por vehículo (?idModelo=1&anio=2020)
routerCompatibilidad.get("/producto/:id", validateId, getVehiculosByProducto);  // 🌍 Vehículos por producto
routerCompatibilidad.get("/:id", validateId, getCompatibilidadById);            // 🌍 Detalle de compatibilidad

// ─── Rutas protegidas (Admin) ────────────────────────────────────────────────
routerCompatibilidad.post("/", verifyJWT, isAdmin, validateCompatibilidad, createCompatibilidad);
routerCompatibilidad.put("/:id", verifyJWT, isAdmin, validateId, validateCompatibilidad, updateCompatibilidad);
routerCompatibilidad.delete("/:id", verifyJWT, isAdmin, validateId, deleteCompatibilidad);

module.exports = routerCompatibilidad;
