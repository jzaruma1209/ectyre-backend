const express = require("express");
const router = express.Router();
const { sitemap } = require("../controllers/seo.controllers");

// ─── Rutas públicas de SEO ──────────────────────────────────────────
router.get("/sitemap.xml", sitemap); // 🌍 Sitemap de la tienda (productos y marcas activos)

module.exports = router;
