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
const imagenRouter = require("./imagen.router");
const catalogoRouter = require("./catalogo.router");
const compatibilidadRouter = require("./compatibilidad.router");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a API Ectyre v1",
    endpoints: ["/auth", "/llantas", "/clientes", "/carrito", "/pedidos", "/direcciones", "/vehiculos", "/catalogos", "/compatibilidad", "/admin", "/admin/promociones"]
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
router.use("/admin", imagenRouter);   // 🖼️ Imágenes Cloudinary
router.use("/vehiculos", vehiculoRouter);
router.use("/catalogos", catalogoRouter);          // 📋 Catálogos de llantas
router.use("/compatibilidad", compatibilidadRouter); // 🔗 Compatibilidad llanta-vehículo
router.use("/admin/promociones", require("./promocion.router")); // 🖼️ Imágenes de promoción

module.exports = router;
