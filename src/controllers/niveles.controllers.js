"use strict";

const nivelesService = require("../services/niveles.services");
const catchError = require("../utils/catchError");

const todos = (req) => req.query.todos === "true";
const ok = (res, status, message, data) => res.status(status).json({ success: true, message, data });

// ─── Consolidado ─────────────────────────────────────────────────────────────
const obtenerNiveles = catchError(async (req, res) => {
  ok(res, 200, "Niveles de inventario obtenidos", await nivelesService.obtenerNiveles({ todos: todos(req) }));
});

// ─── Tipos de producto ───────────────────────────────────────────────────────
const listarTiposProducto = catchError(async (req, res) => {
  ok(res, 200, "Tipos de producto obtenidos", await nivelesService.listarTiposProducto({ todos: todos(req) }));
});
const crearTipoProducto = catchError(async (req, res) => {
  ok(res, 201, "Tipo de producto creado", await nivelesService.crearTipoProducto(req.body));
});
const actualizarTipoProducto = catchError(async (req, res) => {
  ok(res, 200, "Tipo de producto actualizado", await nivelesService.actualizarTipoProducto(req.params.id, req.body));
});
const eliminarTipoProducto = catchError(async (req, res) => {
  const data = await nivelesService.eliminarTipoProducto(req.params.id);
  ok(res, 200, data.message, data);
});

// ─── Marcas ──────────────────────────────────────────────────────────────────
const listarMarcas = catchError(async (req, res) => {
  const data = await nivelesService.listarMarcas({ idTipoProducto: req.query.idTipoProducto, todos: todos(req) });
  ok(res, 200, "Marcas obtenidas", data);
});
const crearMarca = catchError(async (req, res) => {
  ok(res, 201, "Marca creada", await nivelesService.crearMarca(req.body, req.files || {}));
});
const actualizarMarca = catchError(async (req, res) => {
  ok(res, 200, "Marca actualizada", await nivelesService.actualizarMarca(req.params.id, req.body, req.files || {}));
});
const eliminarMarca = catchError(async (req, res) => {
  const data = await nivelesService.eliminarMarca(req.params.id);
  ok(res, 200, data.message, data);
});

// ─── Modelos ─────────────────────────────────────────────────────────────────
const listarModelos = catchError(async (req, res) => {
  const data = await nivelesService.listarModelos({
    idMarca: req.query.idMarca,
    idTipoProducto: req.query.idTipoProducto,
    todos: todos(req),
  });
  ok(res, 200, "Modelos obtenidos", data);
});
const crearModelo = catchError(async (req, res) => {
  ok(res, 201, "Modelo creado", await nivelesService.crearModelo(req.body));
});
const actualizarModelo = catchError(async (req, res) => {
  ok(res, 200, "Modelo actualizado", await nivelesService.actualizarModelo(req.params.id, req.body));
});
const eliminarModelo = catchError(async (req, res) => {
  const data = await nivelesService.eliminarModelo(req.params.id);
  ok(res, 200, data.message, data);
});

// ─── Tipos de uso ────────────────────────────────────────────────────────────
const listarTiposUso = catchError(async (req, res) => {
  ok(res, 200, "Tipos de uso obtenidos", await nivelesService.listarTiposUso());
});
const crearTipoUso = catchError(async (req, res) => {
  ok(res, 201, "Tipo de uso creado", await nivelesService.crearTipoUso(req.body));
});
const actualizarTipoUso = catchError(async (req, res) => {
  ok(res, 200, "Tipo de uso actualizado", await nivelesService.actualizarTipoUso(req.params.id, req.body));
});
const eliminarTipoUso = catchError(async (req, res) => {
  const data = await nivelesService.eliminarTipoUso(req.params.id);
  ok(res, 200, data.message, data);
});

// ─── Medidas (anchos / altos / aros) ────────────────────────────────────────
const listarMedidas = catchError(async (req, res) => {
  ok(res, 200, "Medidas obtenidas", await nivelesService.listarMedidas(req.params.tipo, { todos: todos(req) }));
});
const crearMedida = catchError(async (req, res) => {
  ok(res, 201, "Medida creada", await nivelesService.crearMedida(req.params.tipo, req.body));
});
const crearMedidasLote = catchError(async (req, res) => {
  const data = await nivelesService.crearMedidasLote(req.params.tipo, req.body);
  ok(res, 201, `${data.creados.length} medida(s) importada(s)`, data);
});
const actualizarMedida = catchError(async (req, res) => {
  ok(res, 200, "Medida actualizada", await nivelesService.actualizarMedida(req.params.tipo, req.params.id, req.body));
});
const eliminarMedida = catchError(async (req, res) => {
  const data = await nivelesService.eliminarMedida(req.params.tipo, req.params.id);
  ok(res, 200, data.message, data);
});

// ─── Especificaciones técnicas ──────────────────────────────────────────────
const listarEspecificaciones = catchError(async (req, res) => {
  const data = await nivelesService.listarEspecificaciones({
    idTipoProducto: req.query.idTipoProducto,
    todos: todos(req),
  });
  ok(res, 200, "Especificaciones obtenidas", data);
});
const crearEspecificacion = catchError(async (req, res) => {
  ok(res, 201, "Especificación creada", await nivelesService.crearEspecificacion(req.body, req.file || null));
});
const actualizarEspecificacion = catchError(async (req, res) => {
  const data = await nivelesService.actualizarEspecificacion(req.params.id, req.body, req.file || null);
  ok(res, 200, "Especificación actualizada", data);
});
const eliminarEspecificacion = catchError(async (req, res) => {
  const data = await nivelesService.eliminarEspecificacion(req.params.id);
  ok(res, 200, data.message, data);
});

module.exports = {
  obtenerNiveles,
  listarTiposProducto,
  crearTipoProducto,
  actualizarTipoProducto,
  eliminarTipoProducto,
  listarMarcas,
  crearMarca,
  actualizarMarca,
  eliminarMarca,
  listarModelos,
  crearModelo,
  actualizarModelo,
  eliminarModelo,
  listarTiposUso,
  crearTipoUso,
  actualizarTipoUso,
  eliminarTipoUso,
  listarMedidas,
  crearMedida,
  crearMedidasLote,
  actualizarMedida,
  eliminarMedida,
  listarEspecificaciones,
  crearEspecificacion,
  actualizarEspecificacion,
  eliminarEspecificacion,
};
