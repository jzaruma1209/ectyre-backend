const carritoService = require("../services/carrito.services");
const catchError = require("../utils/catchError");

// Obtener carrito
const getCarrito = catchError(async (req, res) => {
  const idCliente = req.user?.idCliente;
  const sesionId = req.query.sesionId;

  const carrito = await carritoService.getOrCreateCarrito(idCliente, sesionId);

  res.status(200).json({
    success: true,
    message: "Carrito obtenido correctamente",
    data: carrito,
  });
});

// Agregar item al carrito
const agregarItem = catchError(async (req, res) => {
  const idCliente = req.user?.idCliente;
  const sesionId = req.body.sesionId;
  const { idLlanta, cantidad } = req.body;

  // Obtener o crear carrito
  const carritoExistente = await carritoService.getOrCreateCarrito(
    idCliente,
    sesionId
  );

  // Agregar item
  const carrito = await carritoService.agregarItem(
    carritoExistente.carrito.idCarrito,
    idLlanta,
    cantidad
  );

  res.status(200).json({
    success: true,
    message: "Producto agregado al carrito",
    data: carrito,
  });
});

// Actualizar cantidad de item
const actualizarItem = catchError(async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  const carrito = await carritoService.actualizarItem(parseInt(id), cantidad);

  res.status(200).json({
    success: true,
    message: "Cantidad actualizada",
    data: carrito,
  });
});

// Eliminar item del carrito
const eliminarItem = catchError(async (req, res) => {
  const { id } = req.params;

  const carrito = await carritoService.eliminarItem(parseInt(id));

  res.status(200).json({
    success: true,
    message: "Producto eliminado del carrito",
    data: carrito,
  });
});

// Vaciar carrito
const vaciarCarrito = catchError(async (req, res) => {
  const idCliente = req.user?.idCliente;
  const sesionId = req.query.sesionId;

  const carritoExistente = await carritoService.getOrCreateCarrito(
    idCliente,
    sesionId
  );
  const result = await carritoService.vaciarCarrito(
    carritoExistente.carrito.idCarrito
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  getCarrito,
  agregarItem,
  actualizarItem,
  eliminarItem,
  vaciarCarrito,
};
