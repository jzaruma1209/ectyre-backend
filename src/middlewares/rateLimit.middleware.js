const rateLimit = require("express-rate-limit");

// ─── Leer configuración desde variables de entorno ───────────────────
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const MAX_GENERAL = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

/**
 * Handler de respuesta estandarizado para todos los rate limiters
 * Devuelve JSON consistente con el resto de la API
 */
const rateLimitHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    message: "Demasiadas peticiones. Por favor intente más tarde.",
    retryAfter: Math.ceil(res.getHeader("RateLimit-Reset") || 0),
  });
};

/**
 * Rate limiter GENERAL para toda la API
 * Configurable por variables de entorno: RATE_LIMIT_WINDOW_MS y RATE_LIMIT_MAX
 * Ejemplo: 100 peticiones cada 15 minutos por IP
 */
const rateLimitAPI = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_GENERAL,
  standardHeaders: "draft-7", // Cabeceras RateLimit-* estándar (RFC 6585)
  legacyHeaders: false,        // Deshabilitar X-RateLimit-* legacy
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Demasiadas peticiones a la API. Por favor intente más tarde.",
    });
  },
  // Clave por IP — soporta proxies (Vercel, Nginx, etc.)
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  },
  skip: (req) => {
    // No aplicar a health check para monitoreo
    return req.path === "/health";
  },
});

/**
 * Rate limiter para intentos de LOGIN
 * Previene ataques de fuerza bruta: 5 intentos por 15 min por IP
 */
const rateLimitLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,                    // Máximo 5 intentos
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Demasiados intentos de inicio de sesión. Intente en 15 minutos.",
    });
  },
  keyGenerator: (req) => {
    // Combinar IP + email si está disponible para mayor precisión
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
    const email = req.body?.email || "";
    return `login_${ip}_${email}`;
  },
});

/**
 * Rate limiter ESTRICTO para operaciones sensibles
 * (registro, cambio de contraseña, generación de tokens): 10 por hora por IP
 */
const rateLimitStrict = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,                   // Máximo 10 peticiones
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Límite de operaciones sensibles alcanzado. Intente en 1 hora.",
    });
  },
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  },
});

/**
 * Rate limiter para registro de nuevos clientes
 * Previene creación masiva de cuentas: 3 registros por hora por IP
 */
const rateLimitRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,                    // Máximo 3 registros
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Límite de registros alcanzado desde esta IP. Intente en 1 hora.",
    });
  },
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  },
});

module.exports = {
  rateLimitAPI,
  rateLimitLogin,
  rateLimitStrict,
  rateLimitRegistro,
};
