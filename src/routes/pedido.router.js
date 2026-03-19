const express = require("express");
const {
  checkout,
  getPedidos,
  getPedidoById,
  getTracking,
} = require("../controllers/pedido.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  validatePedidoData,
  validateId,
} = require("../middlewares/validation.middleware");

const routerPedido = express.Router();

// Procesar la compra (checkout)
routerPedido.post("/checkout", verifyJWT, validatePedidoData, checkout); // 🔒 Autenticado

// Listar todos los pedidos del cliente
routerPedido.get("/", verifyJWT, getPedidos); // 🔒 Autenticado

// Detalle de un pedido específico
routerPedido.get("/:id", verifyJWT, validateId, getPedidoById); // 🔒 Autenticado

// Tracking del estado de envío
routerPedido.get("/:id/tracking", verifyJWT, validateId, getTracking); // 🔒 Autenticado

module.exports = routerPedido;
