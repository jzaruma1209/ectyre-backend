const express = require("express");
const {
  registrarCliente,
  loginCliente,
  getPerfilCliente,
  updatePerfilCliente,
} = require("../controllers/cliente.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  validateClienteData,
  validateLoginData,
} = require("../middlewares/validation.middleware");
const { rateLimitLogin } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Rutas públicas
router.post("/registro", validateClienteData, registrarCliente); // 🌍 Público (registro)
router.post("/login", rateLimitLogin, validateLoginData, loginCliente); // 🌍 Público (login)

// Rutas protegidas
router.get("/perfil", verifyJWT, getPerfilCliente); // 🔒 Autenticado
router.put("/perfil", verifyJWT, updatePerfilCliente); // 🔒 Autenticado

module.exports = router;
