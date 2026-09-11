const express = require("express");
const {
  listarLlantas,
  obtenerPublico,
  buscarPorMedida,
  buscarPorVehiculo,
  buscarGeneral,
  obtenerRecomendaciones,
} = require("../controllers/producto.controllers");
const { validateId } = require("../middlewares/validation.middleware");

const router = express.Router();

// ⚠️ DEPRECADO — alias de lectura de /productos para clientes antiguos.
// Devuelve el contrato nuevo de producto. Crear/editar: /admin/productos
router.get("/", listarLlantas);
router.get("/buscar-medida", buscarPorMedida);
router.get("/buscar-vehiculo", buscarPorVehiculo);
router.get("/buscar-general", buscarGeneral);
router.get("/recomendaciones", obtenerRecomendaciones);
router.get("/:id", validateId, obtenerPublico);

module.exports = router;
