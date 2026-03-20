const express = require("express");
const {
  registrarCliente,
  loginCliente,
  logoutCliente,
  getPerfilCliente,
  updatePerfilCliente,
} = require("../controllers/cliente.controllers");

const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  validateClienteData,
  validateLoginData,
} = require("../middlewares/validation.middleware");
const { rateLimitLogin, rateLimitRegistro } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Rutas públicas
router.post("/registro", rateLimitRegistro, validateClienteData, registrarCliente); // 🌍 Público (registro) — 🔒 máx 3 registros/hora por IP
router.post("/login", rateLimitLogin, validateLoginData, loginCliente); // 🌍 Público (login) — 🔒 máx 5 intentos/15min por IP
router.post("/logout", verifyJWT, logoutCliente); // 🔒 Autenticado (logout)

// Rutas protegidas
router.get("/perfil", verifyJWT, getPerfilCliente); // 🔒 Autenticado
router.put("/perfil", verifyJWT, updatePerfilCliente); // 🔒 Autenticado

module.exports = router;
