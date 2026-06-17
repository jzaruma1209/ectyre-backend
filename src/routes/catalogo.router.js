const express = require("express");
const {
  getAllCatalogos,
  getAllModelosLlanta,
  getModeloLlantaById,
  createModeloLlanta,
  updateModeloLlanta,
  deleteModeloLlanta,
  getAllIndicesCarga,
  createIndiceCarga,
  deleteIndiceCarga,
  getAllIndicesVelocidad,
  createIndiceVelocidad,
  deleteIndiceVelocidad,
  getAllTemperaturas,
  createTemperatura,
  deleteTemperatura,
  getAllTiposLlanta,
  createTipoLlanta,
  updateTipoLlanta,
  deleteTipoLlanta,
  getAllSentidosRotacion,
  createSentidoRotacion,
  deleteSentidoRotacion,
} = require("../controllers/catalogo.controllers");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { validateId } = require("../middlewares/validation.middleware");

const routerCatalogo = express.Router();

// ─── Endpoint consolidado ────────────────────────────────────────────────────
routerCatalogo.get("/", getAllCatalogos); // 🌍 Todos los catálogos en uno (para selects del admin)

// ─── Modelos de Llanta ───────────────────────────────────────────────────────
routerCatalogo.get("/modelos-llanta", getAllModelosLlanta);                          // 🌍 Público
routerCatalogo.get("/modelos-llanta/:id", validateId, getModeloLlantaById);         // 🌍 Público
routerCatalogo.post("/modelos-llanta", verifyJWT, createModeloLlanta);              // 🔒 Admin
routerCatalogo.put("/modelos-llanta/:id", verifyJWT, validateId, updateModeloLlanta); // 🔒 Admin
routerCatalogo.delete("/modelos-llanta/:id", verifyJWT, validateId, deleteModeloLlanta); // 🔒 Admin

// ─── Índices de Carga ────────────────────────────────────────────────────────
routerCatalogo.get("/indices-carga", getAllIndicesCarga);                            // 🌍 Público
routerCatalogo.post("/indices-carga", verifyJWT, createIndiceCarga);                // 🔒 Admin
routerCatalogo.delete("/indices-carga/:id", verifyJWT, validateId, deleteIndiceCarga); // 🔒 Admin

// ─── Índices de Velocidad ────────────────────────────────────────────────────
routerCatalogo.get("/indices-velocidad", getAllIndicesVelocidad);                    // 🌍 Público
routerCatalogo.post("/indices-velocidad", verifyJWT, createIndiceVelocidad);        // 🔒 Admin
routerCatalogo.delete("/indices-velocidad/:id", verifyJWT, validateId, deleteIndiceVelocidad); // 🔒 Admin

// ─── Temperaturas ────────────────────────────────────────────────────────────
routerCatalogo.get("/temperaturas", getAllTemperaturas);                             // 🌍 Público
routerCatalogo.post("/temperaturas", verifyJWT, createTemperatura);                 // 🔒 Admin
routerCatalogo.delete("/temperaturas/:id", verifyJWT, validateId, deleteTemperatura); // 🔒 Admin

// ─── Tipos de Llanta ─────────────────────────────────────────────────────────
routerCatalogo.get("/tipos-llanta", getAllTiposLlanta);                             // 🌍 Público
routerCatalogo.post("/tipos-llanta", verifyJWT, createTipoLlanta);                 // 🔒 Admin
routerCatalogo.put("/tipos-llanta/:id", verifyJWT, validateId, updateTipoLlanta);  // 🔒 Admin
routerCatalogo.delete("/tipos-llanta/:id", verifyJWT, validateId, deleteTipoLlanta); // 🔒 Admin

// ─── Sentidos de Rotación ─────────────────────────────────────────────────────
routerCatalogo.get("/sentidos-rotacion", getAllSentidosRotacion);                   // 🌍 Público
routerCatalogo.post("/sentidos-rotacion", verifyJWT, createSentidoRotacion);       // 🔒 Admin
routerCatalogo.delete("/sentidos-rotacion/:id", verifyJWT, validateId, deleteSentidoRotacion); // 🔒 Admin

module.exports = routerCatalogo;
