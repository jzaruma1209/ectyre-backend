const direccionService = require("../services/direccion.services");
const catchError = require("../utils/catchError");

// Obtener todas las direcciones del cliente autenticado
const getDirecciones = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const direcciones = await direccionService.getDirecciones(idCliente);
  res.status(200).json({
    success: true,
    message: "Direcciones obtenidas correctamente",
    data: direcciones,
  });
});

// Crear una nueva dirección
const createDireccion = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const nuevaDireccion = await direccionService.createDireccion(
    idCliente,
    req.body
  );
  res.status(201).json({
    success: true,
    message: "Dirección creada correctamente",
    data: nuevaDireccion,
  });
});

// Actualizar una dirección
const updateDireccion = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const { id } = req.params;
  const actualizada = await direccionService.updateDireccion(
    id,
    idCliente,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Dirección actualizada correctamente",
    data: actualizada,
  });
});

// Eliminar una dirección
const deleteDireccion = catchError(async (req, res) => {
  const { idCliente } = req.user;
  const { id } = req.params;
  const result = await direccionService.deleteDireccion(id, idCliente);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  getDirecciones,
  createDireccion,
  updateDireccion,
  deleteDireccion,
};
