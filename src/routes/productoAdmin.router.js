const express = require("express");
const {
  listarAdmin,
  obtenerAdmin,
  crear,
  actualizar,
  cambiarEstado,
  desactivar,
} = require("../controllers/producto.controllers");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const { validateId } = require("../middlewares/validation.middleware");
const { uploadImagenesProducto } = require("../middlewares/upload.middleware");

const router = express.Router();

router.use(verifyJWT, isAdmin);

// ─── Productos (Admin) ──────────────────────────────────────
// POST/PUT aceptan multipart: campo "datos" (JSON) + "imagenes" (máx 5), o JSON directo sin fotos
router.get("/", listarAdmin);                                                  // 🔒 ?page=&limit=&search=&idTipoProducto=&estado=
router.get("/:id", validateId, obtenerAdmin);                                   // 🔒 Detalle (incluye inactivos)
router.post("/", uploadImagenesProducto, crear);                                // 🔒 Crear con validaciones de negocio
router.put("/:id", validateId, uploadImagenesProducto, actualizar);             // 🔒 Editar
router.patch("/:id/estado", validateId, cambiarEstado);                         // 🔒 Activar / desactivar
router.delete("/:id", validateId, desactivar);                                  // 🔒 Borrado lógico

module.exports = router;
