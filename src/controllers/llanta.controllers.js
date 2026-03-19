const llantaService = require("../services/llanta.services");
const catchError = require("../utils/catchError");

// Obtener todas las llantas
const getAllLlantas = catchError(async (req, res) => {
  const filters = {
    destacado: req.query.destacado === "true",
    idMarca: req.query.idMarca,
    ancho: req.query.ancho,
    perfil: req.query.perfil,
    rin: req.query.rin,
  };

  const llantas = await llantaService.getAllLlantas(filters);

  res.status(200).json({
    success: true,
    message: "Llantas obtenidas correctamente",
    data: llantas,
  });
});

// Obtener llanta por ID
const getLlantaById = catchError(async (req, res) => {
  const { id } = req.params;
  const llanta = await llantaService.getLlantaById(id);

  res.status(200).json({
    success: true,
    message: "Llanta obtenida correctamente",
    data: llanta,
  });
});

// Buscar por medida
const buscarPorMedida = catchError(async (req, res) => {
  const { ancho, perfil, rin } = req.query;

  if (!ancho || !perfil || !rin) {
    return res.status(400).json({
      success: false,
      message: "Se requieren los parámetros: ancho, perfil y rin",
    });
  }

  const llantas = await llantaService.buscarPorMedida(
    parseInt(ancho),
    parseInt(perfil),
    parseInt(rin)
  );

  res.status(200).json({
    success: true,
    message: "Búsqueda completada",
    data: llantas,
  });
});

// Buscar por vehículo
const buscarPorVehiculo = catchError(async (req, res) => {
  const { marca, modelo, anio } = req.query;

  if (!marca || !modelo || !anio) {
    return res.status(400).json({
      success: false,
      message: "Se requieren los parámetros: marca, modelo y año",
    });
  }

  const llantas = await llantaService.buscarPorVehiculo(
    marca,
    modelo,
    parseInt(anio)
  );

  res.status(200).json({
    success: true,
    message: "Búsqueda completada",
    data: llantas,
  });
});

// Crear llanta (Admin)
const createLlanta = catchError(async (req, res) => {
  const llanta = await llantaService.createLlanta(req.body);

  res.status(201).json({
    success: true,
    message: "Llanta creada correctamente",
    data: llanta,
  });
});

// Actualizar llanta (Admin)
const updateLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const llanta = await llantaService.updateLlanta(id, req.body);

  res.status(200).json({
    success: true,
    message: "Llanta actualizada correctamente",
    data: llanta,
  });
});

// Eliminar llanta (Admin)
const deleteLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await llantaService.deleteLlanta(id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = {
  getAllLlantas,
  getLlantaById,
  buscarPorMedida,
  buscarPorVehiculo,
  createLlanta,
  updateLlanta,
  deleteLlanta,
};
