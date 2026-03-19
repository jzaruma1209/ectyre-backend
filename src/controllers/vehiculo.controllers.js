const vehiculoService = require("../services/vehiculo.services");
const catchError = require("../utils/catchError");

// Obtener todas las marcas de vehículos activas
const getMarcas = catchError(async (req, res) => {
  const marcas = await vehiculoService.getMarcas();
  res.status(200).json({
    success: true,
    message: "Marcas de vehículos obtenidas correctamente",
    data: marcas,
  });
});

// Obtener modelos de una marca específica
const getModelosByMarca = catchError(async (req, res) => {
  const { idMarca } = req.params;
  const resultado = await vehiculoService.getModelosByMarca(idMarca);
  res.status(200).json({
    success: true,
    message: "Modelos obtenidos correctamente",
    data: resultado,
  });
});

// Obtener todas las marcas con sus modelos (para selects anidados en frontend)
const getMarcasConModelos = catchError(async (req, res) => {
  const marcas = await vehiculoService.getMarcasConModelos();
  res.status(200).json({
    success: true,
    message: "Marcas y modelos obtenidos correctamente",
    data: marcas,
  });
});

module.exports = {
  getMarcas,
  getModelosByMarca,
  getMarcasConModelos,
};
