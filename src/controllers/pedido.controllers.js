const pedidoService = require("../services/pedido.services");
const catchError = require("../utils/catchError");

// Procesar checkout (crear pedido desde carrito)
const checkout = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const pedido = await pedidoService.checkout(idCliente, req.body);
  res.status(201).json({
    success: true,
    message: "Pedido creado correctamente",
    data: pedido,
  });
});

// Obtener todos los pedidos del cliente autenticado
const getPedidos = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const pedidos = await pedidoService.getPedidos(idCliente);
  res.status(200).json({
    success: true,
    message: "Pedidos obtenidos correctamente",
    data: pedidos,
  });
});

// Obtener detalle de un pedido
const getPedidoById = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const { id } = req.params;
  const pedido = await pedidoService.getPedidoById(id, idCliente);
  res.status(200).json({
    success: true,
    message: "Pedido obtenido correctamente",
    data: pedido,
  });
});

// Obtener tracking de un pedido
const getTracking = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const { id } = req.params;
  const tracking = await pedidoService.getTracking(id, idCliente);
  res.status(200).json({
    success: true,
    message: "Tracking obtenido correctamente",
    data: tracking,
  });
});

module.exports = {
  checkout,
  getPedidos,
  getPedidoById,
  getTracking,
};
