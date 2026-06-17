const catalogoService = require("../services/catalogo.services");
const catchError = require("../utils/catchError");

// ─── Catálogos consolidados ──────────────────────────────────────────────────

// GET /catalogos — todos los catálogos en un solo request (para selects del admin)
const getAllCatalogos = catchError(async (req, res) => {
  const data = await catalogoService.getAllCatalogos();
  res.status(200).json({
    success: true,
    message: "Catálogos obtenidos correctamente",
    data,
  });
});

// ─── Modelos de Llanta ───────────────────────────────────────────────────────

const getAllModelosLlanta = catchError(async (req, res) => {
  const data = await catalogoService.getAllModelosLlanta();
  res.status(200).json({ success: true, message: "Modelos de llanta obtenidos correctamente", data });
});

const getModeloLlantaById = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.getModeloLlantaById(id);
  res.status(200).json({ success: true, message: "Modelo de llanta obtenido correctamente", data });
});

const createModeloLlanta = catchError(async (req, res) => {
  const data = await catalogoService.createModeloLlanta(req.body);
  res.status(201).json({ success: true, message: "Modelo de llanta creado correctamente", data });
});

const updateModeloLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.updateModeloLlanta(id, req.body);
  res.status(200).json({ success: true, message: "Modelo de llanta actualizado correctamente", data });
});

const deleteModeloLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteModeloLlanta(id);
  res.status(200).json({ success: true, message: data.message, data });
});

// ─── Índices de Carga ────────────────────────────────────────────────────────

const getAllIndicesCarga = catchError(async (req, res) => {
  const data = await catalogoService.getAllIndicesCarga();
  res.status(200).json({ success: true, message: "Índices de carga obtenidos correctamente", data });
});

const createIndiceCarga = catchError(async (req, res) => {
  const data = await catalogoService.createIndiceCarga(req.body);
  res.status(201).json({ success: true, message: "Índice de carga creado correctamente", data });
});

const deleteIndiceCarga = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteIndiceCarga(id);
  res.status(200).json({ success: true, message: data.message, data });
});

// ─── Índices de Velocidad ────────────────────────────────────────────────────

const getAllIndicesVelocidad = catchError(async (req, res) => {
  const data = await catalogoService.getAllIndicesVelocidad();
  res.status(200).json({ success: true, message: "Índices de velocidad obtenidos correctamente", data });
});

const createIndiceVelocidad = catchError(async (req, res) => {
  const data = await catalogoService.createIndiceVelocidad(req.body);
  res.status(201).json({ success: true, message: "Índice de velocidad creado correctamente", data });
});

const deleteIndiceVelocidad = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteIndiceVelocidad(id);
  res.status(200).json({ success: true, message: data.message, data });
});

// ─── Temperaturas ────────────────────────────────────────────────────────────

const getAllTemperaturas = catchError(async (req, res) => {
  const data = await catalogoService.getAllTemperaturas();
  res.status(200).json({ success: true, message: "Temperaturas obtenidas correctamente", data });
});

const createTemperatura = catchError(async (req, res) => {
  const data = await catalogoService.createTemperatura(req.body);
  res.status(201).json({ success: true, message: "Temperatura creada correctamente", data });
});

const deleteTemperatura = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteTemperatura(id);
  res.status(200).json({ success: true, message: data.message, data });
});

// ─── Tipos de Llanta ─────────────────────────────────────────────────────────

const getAllTiposLlanta = catchError(async (req, res) => {
  const data = await catalogoService.getAllTiposLlanta();
  res.status(200).json({ success: true, message: "Tipos de llanta obtenidos correctamente", data });
});

const createTipoLlanta = catchError(async (req, res) => {
  const data = await catalogoService.createTipoLlanta(req.body);
  res.status(201).json({ success: true, message: "Tipo de llanta creado correctamente", data });
});

const updateTipoLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.updateTipoLlanta(id, req.body);
  res.status(200).json({ success: true, message: "Tipo de llanta actualizado correctamente", data });
});

const deleteTipoLlanta = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteTipoLlanta(id);
  res.status(200).json({ success: true, message: data.message, data });
});

// ─── Sentidos de Rotación ─────────────────────────────────────────────────────

const getAllSentidosRotacion = catchError(async (req, res) => {
  const data = await catalogoService.getAllSentidosRotacion();
  res.status(200).json({ success: true, message: "Sentidos de rotación obtenidos correctamente", data });
});

const createSentidoRotacion = catchError(async (req, res) => {
  const data = await catalogoService.createSentidoRotacion(req.body);
  res.status(201).json({ success: true, message: "Sentido de rotación creado correctamente", data });
});

const deleteSentidoRotacion = catchError(async (req, res) => {
  const { id } = req.params;
  const data = await catalogoService.deleteSentidoRotacion(id);
  res.status(200).json({ success: true, message: data.message, data });
});

module.exports = {
  getAllCatalogos,
  // Modelos llanta
  getAllModelosLlanta,
  getModeloLlantaById,
  createModeloLlanta,
  updateModeloLlanta,
  deleteModeloLlanta,
  // Índices carga
  getAllIndicesCarga,
  createIndiceCarga,
  deleteIndiceCarga,
  // Índices velocidad
  getAllIndicesVelocidad,
  createIndiceVelocidad,
  deleteIndiceVelocidad,
  // Temperaturas
  getAllTemperaturas,
  createTemperatura,
  deleteTemperatura,
  // Tipos llanta
  getAllTiposLlanta,
  createTipoLlanta,
  updateTipoLlanta,
  deleteTipoLlanta,
  // Sentidos rotación
  getAllSentidosRotacion,
  createSentidoRotacion,
  deleteSentidoRotacion,
};
