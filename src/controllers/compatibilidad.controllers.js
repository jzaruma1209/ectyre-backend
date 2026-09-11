const compatibilidadService = require("../services/compatibilidad.services");
const catchError = require("../utils/catchError");

// GET /compatibilidad/vehiculo?idModelo=1&anio=2020
const getProductosByVehiculo = catchError(async (req, res) => {
  const { idModelo, anio } = req.query;

  if (!idModelo || !anio) {
    return res.status(400).json({
      success: false,
      message: "Se requieren los parámetros: idModelo y anio",
    });
  }

  const data = await compatibilidadService.getProductosByVehiculo({
    idModelo: parseInt(idModelo),
    anio: parseInt(anio),
  });

  res.status(200).json({
    success: true,
    message: "Productos compatibles obtenidos correctamente",
    data,
  });
});

// GET /compatibilidad/producto/:id
const getVehiculosByProducto = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await compatibilidadService.getVehiculosByProducto(id);

  res.status(200).json({
    success: true,
    message: "Vehículos compatibles obtenidos correctamente",
    data,
  });
});

// GET /compatibilidad/:id
const getCompatibilidadById = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await compatibilidadService.getCompatibilidadById(id);

  res.status(200).json({
    success: true,
    message: "Compatibilidad obtenida correctamente",
    data,
  });
});

// POST /compatibilidad (Admin)
const createCompatibilidad = catchError(async (req, res) => {
  const data = await compatibilidadService.createCompatibilidad(req.body);

  res.status(201).json({
    success: true,
    message: "Compatibilidad creada correctamente",
    data,
  });
});

// PUT /compatibilidad/:id (Admin)
const updateCompatibilidad = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await compatibilidadService.updateCompatibilidad(id, req.body);

  res.status(200).json({
    success: true,
    message: "Compatibilidad actualizada correctamente",
    data,
  });
});

// DELETE /compatibilidad/:id (Admin)
const deleteCompatibilidad = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await compatibilidadService.deleteCompatibilidad(id);

  res.status(200).json({
    success: true,
    message: data.message,
    data,
  });
});

module.exports = {
  getProductosByVehiculo,
  getVehiculosByProducto,
  getCompatibilidadById,
  createCompatibilidad,
  updateCompatibilidad,
  deleteCompatibilidad,
};
