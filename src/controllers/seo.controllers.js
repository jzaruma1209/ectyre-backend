"use strict";

const productoService = require("../services/producto.services");
const catchError = require("../utils/catchError");

// ─── Sitemap para Google ────────────────────────────────────────────
// El frontend reescribe https://www.ectyre.com/sitemap.xml hacia este endpoint (vercel.json),
// así el sitemap siempre refleja los productos activos sin volver a desplegar la tienda.
const SITE_URL = (process.env.SITE_URL || "https://www.ectyre.com").replace(/\/$/, "");

const escaparXml = (texto) =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fechaIso = (valor) => {
  const fecha = valor ? new Date(valor) : null;
  return fecha && !Number.isNaN(fecha.getTime()) ? fecha.toISOString().slice(0, 10) : null;
};

const urlXml = ({ ruta, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escaparXml(`${SITE_URL}${ruta}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

const sitemap = catchError(async (req, res) => {
  const productos = await productoService.listarPublico();

  const urls = [
    { ruta: "/", changefreq: "daily", priority: "1.0" },
    { ruta: "/ubicacion", changefreq: "monthly", priority: "0.5" },
  ];

  // Marcas con productos activos (la tienda las enlaza como /brand/<nombre en minúsculas>)
  const marcas = new Map();
  productos.forEach((producto) => {
    const lastmod = fechaIso(producto.updatedAt);
    urls.push({ ruta: `/product/${producto.idProducto}`, lastmod, changefreq: "weekly", priority: "0.8" });

    const nombreMarca = producto.marca?.nombre?.trim().toLowerCase();
    if (nombreMarca && (!marcas.has(nombreMarca) || (lastmod && lastmod > marcas.get(nombreMarca)))) {
      marcas.set(nombreMarca, lastmod);
    }
  });
  marcas.forEach((lastmod, nombre) => {
    urls.push({ ruta: `/brand/${encodeURIComponent(nombre)}`, lastmod, changefreq: "weekly", priority: "0.6" });
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(urlXml),
    "</urlset>",
  ].join("\n");

  res.set("Content-Type", "application/xml; charset=utf-8");
  // Caché de 1 h en el CDN de Vercel; Google lo consulta pocas veces al día.
  res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
});

module.exports = { sitemap };
