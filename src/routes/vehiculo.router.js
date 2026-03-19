const express = require("express");
const {
  getMarcas,
  getModelosByMarca,
  getMarcasConModelos,
} = require("../controllers/vehiculo.controllers");

const routerVehiculo = express.Router();

// Todas las rutas del catálogo de vehículos son públicas
routerVehiculo.get("/marcas", getMarcas); // 🌍 Listar marcas activas
routerVehiculo.get("/marcas/completo", getMarcasConModelos); // 🌍 Marcas + modelos anidados
routerVehiculo.get("/marcas/:idMarca/modelos", getModelosByMarca); // 🌍 Modelos de una marca

module.exports = routerVehiculo;
