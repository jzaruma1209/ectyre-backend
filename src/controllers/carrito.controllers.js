const carritoService = require("../services/carrito.services");
const catchError = require("../utils/catchError");

// Obtener carrito
const getCarrito = catchError(async (req, res) => {
  const idCliente = req.user?.idCliente || req.body.idCliente;
  const sesionId = req.query.sesionId;

  const carritoExistente = await carritoService.getOrCreateCarrito(idCliente, sesionId);
  const carrito = await carritoService.getCarritoDetallado(carritoExistente.idCarrito);

  res.status(200).json({
    success: true,
    message: "Carrito obtenido correctamente",
    data: carrito,
  });
});

// Agregar item al carrito
const agregarItem = catchError(async (req, res) => {
  const idCliente = req.user?.idCliente || req.body.idCliente;
  // El frontend envía sesionId como query param (igual que en el resto de
  // rutas del carrito); se acepta también por body para compatibilidad.
  const sesionId = req.query.sesionId || req.body.sesionId;
  const { idProducto, cantidad } = req.body;

  const carritoExistente = await carritoService.getOrCreateCarrito(
    idCliente,
    sesionId
  );

  const carrito = await carritoService.agregarItem(
    carritoExistente.idCarrito,
    idProducto,
    cantidad
  );

  res.status(201).json({
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
  const idCliente = req.user?.idCliente || req.body.idCliente;
  const sesionId = req.query.sesionId;

  const carritoExistente = await carritoService.getOrCreateCarrito(
    idCliente,
    sesionId
  );
  const result = await carritoService.vaciarCarrito(
    carritoExistente.idCarrito
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
