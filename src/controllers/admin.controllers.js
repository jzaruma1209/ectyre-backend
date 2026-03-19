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

module.exports = {
  getDashboard,
  getAllClientes,
  getClienteById,
  toggleClienteActivo,
  getAllPedidos,
  updateEstadoPedido,
};
