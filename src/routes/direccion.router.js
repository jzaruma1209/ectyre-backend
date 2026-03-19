const express = require("express");
const {
  getDirecciones,
  createDireccion,
  updateDireccion,
  deleteDireccion,
} = require("../controllers/direccion.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  validateDireccionData,
  validateId,
} = require("../middlewares/validation.middleware");

const routerDireccion = express.Router();

// Todas las rutas de direcciones requieren autenticación
routerDireccion
  .route("/")
  .get(verifyJWT, getDirecciones) // 🔒 Mis direcciones
  .post(verifyJWT, validateDireccionData, createDireccion); // 🔒 Nueva dirección

routerDireccion
  .route("/:id")
  .put(verifyJWT, validateId, validateDireccionData, updateDireccion) // 🔒 Actualizar dirección
  .delete(verifyJWT, validateId, deleteDireccion); // 🔒 Eliminar dirección

module.exports = routerDireccion;
