const express = require("express");
const {
  getDashboard,
  getAllClientes,
  getClienteById,
  toggleClienteActivo,
  getAllPedidos,
  updateEstadoPedido,
} = require("../controllers/admin.controllers");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const { validateId } = require("../middlewares/validation.middleware");
const { body, validationResult } = require("express-validator");

const routerAdmin = express.Router();

// Middleware combinado: JWT + rol Admin (aplicado a todas las rutas de este router)
routerAdmin.use(verifyJWT, isAdmin);

// ─── Dashboard ──────────────────────────────
routerAdmin.get("/dashboard", getDashboard); // 🔒 Admin — métricas generales

// ─── Clientes ───────────────────────────────
routerAdmin.get("/clientes", getAllClientes); // 🔒 Admin — listar clientes (con ?page=&limit=&search=)
routerAdmin.get("/clientes/:id", validateId, getClienteById); // 🔒 Admin — detalle de cliente
routerAdmin.patch("/clientes/:id/toggle", validateId, toggleClienteActivo); // 🔒 Admin — activar/desactivar cliente

// ─── Pedidos ────────────────────────────────
routerAdmin.get("/pedidos", getAllPedidos); // 🔒 Admin — listar pedidos (con ?page=&estado=)
routerAdmin.patch(
  "/pedidos/:id/estado",
  validateId,
  [
    body("estado")
      .notEmpty()
      .withMessage("El estado es requerido")
      .isIn([
        "PENDIENTE",
        "CONFIRMADO",
        "EN_PREPARACION",
        "ENVIADO",
        "ENTREGADO",
        "CANCELADO",
      ])
      .withMessage("Estado inválido"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Errores de validación", errors: errors.array() });
      }
      next();
    },
  ],
  updateEstadoPedido // 🔒 Admin — cambiar estado de orden
);

module.exports = routerAdmin;
