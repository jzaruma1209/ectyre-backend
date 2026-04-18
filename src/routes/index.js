const express = require("express");
const router = express.Router();

// ─── Google OAuth 2.0 ─────────────────────────────────────────────────
const routerAuth = require("./auth.router");

// Importar routers
const llantaRouter = require("./llanta.router");
const clienteRouter = require("./cliente.router");
const carritoRouter = require("./carrito.router");
const pedidoRouter = require("./pedido.router");
const direccionRouter = require("./direccion.router");
const adminRouter = require("./admin.router");
const vehiculoRouter = require("./vehiculo.router");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a API Ectyre v1",
    endpoints: ["/auth", "/llantas", "/clientes", "/carrito", "/pedidos", "/direcciones", "/vehiculos", "/admin"]
  });
});

// Configurar rutas
router.use("/auth", routerAuth);          // 🔑 Google OAuth
router.use("/llantas", llantaRouter);
router.use("/clientes", clienteRouter);
router.use("/carrito", carritoRouter);
router.use("/pedidos", pedidoRouter);
router.use("/direcciones", direccionRouter);
router.use("/admin", adminRouter);
router.use("/vehiculos", vehiculoRouter);

module.exports = router;
