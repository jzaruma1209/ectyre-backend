const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes");
const errorHandler = require("./utils/errorHandler");

const app = express();

// ─── Configuración de CORS ──────────────────────────────────────────
// En desarrollo acepta cualquier origen; en producción, solo el dominio del frontend
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.CORS_ORIGIN || "https://llantas247.com"
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ─── Middlewares globales ───────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));

// ─── Rutas ─────────────────────────────────────────────────────────
app.use("/api/v1", router);

// Ruta raíz de bienvenida / health check
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Bienvenido a Llantas247 API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      llantas: "/api/v1/llantas",
      clientes: "/api/v1/clientes",
      carrito: "/api/v1/carrito",
      pedidos: "/api/v1/pedidos",
      direcciones: "/api/v1/direcciones",
      vehiculos: "/api/v1/vehiculos",
      admin: "/api/v1/admin",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({ success: true, status: "OK", timestamp: new Date().toISOString() });
});

// Ruta no encontrada (404)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Error handler global ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
