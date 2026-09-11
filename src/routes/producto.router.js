const express = require("express");
const {
  listarPublico,
  obtenerPublico,
  buscarPorMedida,
  buscarPorVehiculo,
  buscarGeneral,
  obtenerRecomendaciones,
} = require("../controllers/producto.controllers");
const { validateId } = require("../middlewares/validation.middleware");

const router = express.Router();

// ── Catálogo público (card del cliente) ─────────────────────
// La creación / edición vive en /admin/productos (JWT + rol admin)
router.get("/", listarPublico);                          // 🌍 ?idTipoProducto=&idMarca=&destacado=&limit=&offset=
router.get("/buscar-medida", buscarPorMedida);           // 🌍 ?ancho=&alto=&aro=
router.get("/buscar-vehiculo", buscarPorVehiculo);       // 🌍 ?marca=&modelo=&anio=
router.get("/buscar-general", buscarGeneral);            // 🌍 ?q=225/75R15 ó texto libre
router.get("/recomendaciones", obtenerRecomendaciones);  // 🌍 ?aro=&excluir=1,2
router.get("/:id", validateId, obtenerPublico);          // 🌍 Detalle

module.exports = router;
