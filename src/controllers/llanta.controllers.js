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

// Buscar por medida exacta
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

/**
 * GET /llantas/buscar-general?q=texto
 *
 * Búsqueda unificada:
 *  - Detecta medida tipo 185/65R14 (+ marca opcional)
 *  - Busca por modelo, descripción, marca
 *
 * Devuelve: { resultados, recomendaciones, tipo, parsedMedida, marcaBuscada }
 */
const buscarGeneral = catchError(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: "Se requiere el parámetro q",
    });
  }

  const { resultados, tipo, parsedMedida, marcaBuscada } =
    await llantaService.buscarGeneral(q);

  // Calcular rin para recomendaciones
  const rinParaRecomendar = parsedMedida?.rin
    || (resultados[0]?.rin ?? null);

  const idsResultados = resultados.map((l) => l.idLlanta);

  const recomendaciones = await llantaService.obtenerRecomendaciones({
    rin: rinParaRecomendar,
    excluirIds: idsResultados,
    limit: 8,
  });

  res.status(200).json({
    success: true,
    message: "Búsqueda completada",
    data: {
      resultados,
      recomendaciones,
      tipo,
      parsedMedida,
      marcaBuscada,
      totalResultados: resultados.length,
    },
  });
});

/**
 * GET /llantas/recomendaciones?rin=14&excluir=1,2,3
 */
const obtenerRecomendaciones = catchError(async (req, res) => {
  const { rin, excluir } = req.query;
  const excluirIds = excluir ? excluir.split(",").map(Number) : [];

  const recomendaciones = await llantaService.obtenerRecomendaciones({
    rin: rin ? parseInt(rin) : null,
    excluirIds,
    limit: 8,
  });

  res.status(200).json({
    success: true,
    message: "Recomendaciones obtenidas",
    data: recomendaciones,
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
  buscarGeneral,
  obtenerRecomendaciones,
  createLlanta,
  updateLlanta,
  deleteLlanta,
};
