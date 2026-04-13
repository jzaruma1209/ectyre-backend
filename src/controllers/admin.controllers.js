const adminService = require("../services/admin.services");
const catchError = require("../utils/catchError");

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

// Obtener métricas del dashboard
const getDashboard = catchError(async (req, res) => {
  const data = await adminService.getDashboard();
  res.status(200).json({
    success: true,
    message: "Dashboard obtenido correctamente",
    data,
  });
});

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────

// Listar todos los clientes con paginación y búsqueda
const getAllClientes = catchError(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const resultado = await adminService.getAllClientes({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
  });
  res.status(200).json({
    success: true,
    message: "Clientes obtenidos correctamente",
    data: resultado,
  });
});

// Ver detalle de un cliente específico
const getClienteById = catchError(async (req, res) => {
  const { id } = req.params;
  const cliente = await adminService.getClienteById(id);
  res.status(200).json({
    success: true,
    message: "Cliente obtenido correctamente",
    data: cliente,
  });
});

// Activar o desactivar un cliente
const toggleClienteActivo = catchError(async (req, res) => {
  const { id } = req.params;
  const resultado = await adminService.toggleClienteActivo(id);
  res.status(200).json({
    success: true,
    message: resultado.message,
    data: resultado,
  });
});

// ─────────────────────────────────────────────
// PEDIDOS
// ─────────────────────────────────────────────

// Listar todos los pedidos (con filtro de estado opcional)
const getAllPedidos = catchError(async (req, res) => {
  const { page = 1, limit = 20, estado } = req.query;
  const resultado = await adminService.getAllPedidos({
    page: parseInt(page),
    limit: parseInt(limit),
    estado,
  });
  res.status(200).json({
    success: true,
    message: "Pedidos obtenidos correctamente",
    data: resultado,
  });
});

// Actualizar el estado de un pedido
const updateEstadoPedido = catchError(async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const pedido = await adminService.updateEstadoPedido(id, estado);
  res.status(200).json({
    success: true,
    message: "Estado del pedido actualizado correctamente",
    data: pedido,
  });
});

// Ver detalle completo de un pedido individual
const getPedidoById = catchError(async (req, res) => {
  const { id } = req.params;
  const pedido = await adminService.getPedidoById(id);
  res.status(200).json({
    success: true,
    message: "Pedido obtenido correctamente",
    data: pedido,
  });
});

// ─────────────────────────────────────────────
// CLIENTES — pedidos de un cliente
// ─────────────────────────────────────────────

// Listar todos los pedidos de un cliente específico
const getPedidosByCliente = catchError(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const resultado = await adminService.getPedidosByCliente(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({
    success: true,
    message: "Pedidos del cliente obtenidos correctamente",
    data: resultado,
  });
});

// ─────────────────────────────────────────────
// INVENTARIO — stock
// ─────────────────────────────────────────────

// Actualizar únicamente el stock de una llanta
const updateStockLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const llanta = await adminService.updateStockLlanta(id, stock);
  res.status(200).json({
    success: true,
    message: "Stock actualizado correctamente",
    data: llanta,
  });
});

// ─────────────────────────────────────────────
// REPORTES
// ─────────────────────────────────────────────

// Reporte de ventas por período (?desde=&hasta=)
const getReporteVentas = catchError(async (req, res) => {
  const { desde, hasta } = req.query;
  const reporte = await adminService.getReporteVentas({ desde, hasta });
  res.status(200).json({
    success: true,
    message: "Reporte de ventas obtenido correctamente",
    data: reporte,
  });
});

// Top productos más vendidos (?limit=10&desde=&hasta=)
const getProductosTop = catchError(async (req, res) => {
  const { limit = 10, desde, hasta } = req.query;
  const reporte = await adminService.getProductosTop({ limit, desde, hasta });
  res.status(200).json({
    success: true,
    message: "Productos top obtenidos correctamente",
    data: reporte,
  });
});

// Estadísticas de carritos (activos, abandonados, convertidos)
const getStatsCarritos = catchError(async (req, res) => {
  const stats = await adminService.getStatsCarritos();
  res.status(200).json({
    success: true,
    message: "Estadísticas de carritos obtenidas correctamente",
    data: stats,
  });
});

module.exports = {
  getDashboard,
  getAllClientes,
  getClienteById,
  toggleClienteActivo,
  getAllPedidos,
  updateEstadoPedido,
  getPedidoById,
  getPedidosByCliente,
  updateStockLlanta,
  getReporteVentas,
  getProductosTop,
  getStatsCarritos,
};
