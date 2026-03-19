const express = require("express");
const router = express.Router();

// Importar routers
const llantaRouter = require("./llanta.router");
const clienteRouter = require("./cliente.router");
const carritoRouter = require("./carrito.router");
const pedidoRouter = require("./pedido.router");
const direccionRouter = require("./direccion.router");
const adminRouter = require("./admin.router");
const vehiculoRouter = require("./vehiculo.router");

// Configurar rutas
router.use("/llantas", llantaRouter);
router.use("/clientes", clienteRouter);
router.use("/carrito", carritoRouter);
router.use("/pedidos", pedidoRouter);
router.use("/direcciones", direccionRouter);
router.use("/admin", adminRouter);
router.use("/vehiculos", vehiculoRouter);

module.exports = router;
