const express = require("express");
const { MetodoPago } = require("../models");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const { validateId } = require("../middlewares/validation.middleware");
const { uploadImagenesMarca, uploadIconoEspecificacion } = require("../middlewares/upload.middleware");
const catchError = require("../utils/catchError");
const n = require("../controllers/niveles.controllers");

const router = express.Router();
const admin = [verifyJWT, isAdmin];

// ═══════════════════════════════════════════════════════════════
// NIVELES DE INVENTARIO — todo lo que se selecciona al crear un producto
// Lectura pública (?todos=true incluye inactivos). Escritura: JWT + Admin
// ═══════════════════════════════════════════════════════════════

router.get("/niveles", n.obtenerNiveles);

// ─── Tipos de producto (con bandera requiereModeloMedidas) ─────
router.get("/tipos-producto", n.listarTiposProducto);
router.post("/tipos-producto", ...admin, n.crearTipoProducto);
router.put("/tipos-producto/:id", ...admin, validateId, n.actualizarTipoProducto);
router.delete("/tipos-producto/:id", ...admin, validateId, n.eliminarTipoProducto);

// ─── Marcas (multipart: logo + banner) ─────────────────────────
router.get("/marcas", n.listarMarcas);                     // ?idTipoProducto=
router.post("/marcas", ...admin, uploadImagenesMarca, n.crearMarca);
router.put("/marcas/:id", ...admin, validateId, uploadImagenesMarca, n.actualizarMarca);
router.delete("/marcas/:id", ...admin, validateId, n.eliminarMarca);

// ─── Modelos (ligados a una marca) ─────────────────────────────
router.get("/modelos", n.listarModelos);                   // ?idMarca=&idTipoProducto=
router.post("/modelos", ...admin, n.crearModelo);
router.put("/modelos/:id", ...admin, validateId, n.actualizarModelo);
router.delete("/modelos/:id", ...admin, validateId, n.eliminarModelo);

// ─── Tipos de uso del modelo (AT, MT, HP…) ─────────────────────
router.get("/tipos-uso", n.listarTiposUso);
router.post("/tipos-uso", ...admin, n.crearTipoUso);
router.put("/tipos-uso/:id", ...admin, validateId, n.actualizarTipoUso);
router.delete("/tipos-uso/:id", ...admin, validateId, n.eliminarTipoUso);

// ─── Medidas: :tipo = anchos | altos | aros ────────────────────
router.get("/medidas/:tipo", n.listarMedidas);
router.post("/medidas/:tipo", ...admin, n.crearMedida);
router.post("/medidas/:tipo/lote", ...admin, n.crearMedidasLote);
router.put("/medidas/:tipo/:id", ...admin, validateId, n.actualizarMedida);
router.delete("/medidas/:tipo/:id", ...admin, validateId, n.eliminarMedida);

// ─── Especificaciones técnicas (multipart: icono) ──────────────
router.get("/especificaciones", n.listarEspecificaciones); // ?idTipoProducto=
router.post("/especificaciones", ...admin, uploadIconoEspecificacion, n.crearEspecificacion);
router.put("/especificaciones/:id", ...admin, validateId, uploadIconoEspecificacion, n.actualizarEspecificacion);
router.delete("/especificaciones/:id", ...admin, validateId, n.eliminarEspecificacion);

// ─── Métodos de pago (lectura) — necesario para el checkout ────
router.get(
  "/metodos-pago",
  catchError(async (req, res) => {
    const metodos = await MetodoPago.findAll({ where: { activo: true }, order: [["idMetodo", "ASC"]] });
    res.status(200).json({ success: true, data: metodos });
  })
);

module.exports = router;
