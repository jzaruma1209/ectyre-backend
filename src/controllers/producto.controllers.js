"use strict";

const productoService = require("../services/producto.services");
const catchError = require("../utils/catchError");
const { ValidationError } = require("../utils/customErrors");

// Acepta JSON directo o multipart con un campo "datos" (JSON en texto) + archivos "imagenes"
const leerDatos = (body = {}) => {
  if (typeof body.datos === "string") {
    try {
      return JSON.parse(body.datos);
    } catch {
      throw new ValidationError("El campo 'datos' no es un JSON válido");
    }
  }
  if (body.datos && typeof body.datos === "object") return body.datos;
  return body;
};

const aNumeroOpcional = (valor) => (valor === undefined || valor === "" ? null : Number(valor));

// ═══════════════════════════════════════════════════════════════
// Catálogo público
// ═══════════════════════════════════════════════════════════════

const listarPublico = catchError(async (req, res) => {
  const data = await productoService.listarPublico(req.query);
  res.status(200).json({ success: true, message: "Productos obtenidos correctamente", data });
});

// Alias de compatibilidad: GET /llantas → solo productos con modelo y medidas
const listarLlantas = catchError(async (req, res) => {
  const data = await productoService.listarPublico({ ...req.query, soloConMedidas: true });
  res.status(200).json({ success: true, message: "Productos obtenidos correctamente", data });
});

const obtenerPublico = catchError(async (req, res) => {
  const data = await productoService.obtenerPublico(req.params.id);
  res.status(200).json({ success: true, message: "Producto obtenido correctamente", data });
});

const buscarPorMedida = catchError(async (req, res) => {
  const ancho = aNumeroOpcional(req.query.ancho);
  const alto = aNumeroOpcional(req.query.alto ?? req.query.perfil);
  const aro = aNumeroOpcional(req.query.aro ?? req.query.rin);
  if ([ancho, alto, aro].every((v) => v === null)) {
    return res.status(400).json({ success: false, message: "Indica al menos ancho, alto o aro" });
  }
  if ([ancho, alto, aro].some((v) => v !== null && !Number.isFinite(v))) {
    return res.status(400).json({ success: false, message: "Las medidas deben ser numéricas" });
  }
  const data = await productoService.buscarPorMedida({ ancho, alto, aro });
  res.status(200).json({ success: true, message: "Búsqueda completada", data });
});

const buscarPorVehiculo = catchError(async (req, res) => {
  const { marca, modelo, anio } = req.query;
  if (!marca || !modelo || !anio || !Number.isInteger(Number(anio))) {
    return res.status(400).json({ success: false, message: "Se requieren los parámetros: marca, modelo y año" });
  }
  const data = await productoService.buscarPorVehiculo({ marca, modelo, anio: Number(anio) });
  res.status(200).json({ success: true, message: "Búsqueda completada", data });
});

const buscarGeneral = catchError(async (req, res) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ success: false, message: "Se requiere el parámetro q" });
  }
  const { resultados, tipo, parsedMedida, marcaBuscada } = await productoService.buscarGeneral(q);
  const aro = parsedMedida?.rin ?? resultados.find((p) => p.medidas)?.medidas?.aro ?? null;
  const recomendaciones = await productoService.obtenerRecomendaciones({
    aro,
    excluirIds: resultados.map((p) => p.idProducto),
    limit: 8,
  });
  res.status(200).json({
    success: true,
    message: "Búsqueda completada",
    data: { resultados, recomendaciones, tipo, parsedMedida, marcaBuscada, totalResultados: resultados.length },
  });
});

const obtenerRecomendaciones = catchError(async (req, res) => {
  const aro = aNumeroOpcional(req.query.aro ?? req.query.rin);
  const excluirIds = req.query.excluir ? String(req.query.excluir).split(",").map(Number) : [];
  const data = await productoService.obtenerRecomendaciones({ aro, excluirIds, limit: 8 });
  res.status(200).json({ success: true, message: "Recomendaciones obtenidas", data });
});

// ═══════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════

const listarAdmin = catchError(async (req, res) => {
  const data = await productoService.listarAdmin(req.query);
  res.status(200).json({ success: true, message: "Productos obtenidos correctamente", data });
});

const obtenerAdmin = catchError(async (req, res) => {
  const data = await productoService.obtenerAdmin(req.params.id);
  res.status(200).json({ success: true, message: "Producto obtenido correctamente", data });
});

const crear = catchError(async (req, res) => {
  const data = await productoService.crear(leerDatos(req.body), req.files || []);
  res.status(201).json({ success: true, message: "Producto creado correctamente", data });
});

const actualizar = catchError(async (req, res) => {
  const data = await productoService.actualizar(req.params.id, leerDatos(req.body), req.files || []);
  res.status(200).json({ success: true, message: "Producto actualizado correctamente", data });
});

const cambiarEstado = catchError(async (req, res) => {
  const data = await productoService.cambiarEstado(req.params.id, req.body?.activo);
  res.status(200).json({
    success: true,
    message: data.activo ? "Producto activado" : "Producto desactivado",
    data,
  });
});

const desactivar = catchError(async (req, res) => {
  const data = await productoService.desactivar(req.params.id);
  res.status(200).json({ success: true, message: data.message, data });
});

module.exports = {
  listarPublico,
  listarLlantas,
  obtenerPublico,
  buscarPorMedida,
  buscarPorVehiculo,
  buscarGeneral,
  obtenerRecomendaciones,
  listarAdmin,
  obtenerAdmin,
  crear,
  actualizar,
  cambiarEstado,
  desactivar,
};
