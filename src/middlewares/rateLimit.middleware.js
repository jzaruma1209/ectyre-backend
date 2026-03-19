const rateLimit = require("express-rate-limit");

/**
 * Rate limiter para intentos de login
 * Previene ataques de fuerza bruta
 */
const rateLimitLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: {
    success: false,
    message: "Demasiados intentos de login. Por favor intente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Identificar por IP
  keyGenerator: (req) => {
    return req.ip;
  },
});

/**
 * Rate limiter general para APIs
 */
const rateLimitAPI = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones
  message: {
    success: false,
    message: "Demasiadas peticiones. Por favor intente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto para operaciones sensibles
 */
const rateLimitStrict = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 peticiones
  message: {
    success: false,
    message: "Límite de operaciones alcanzado. Intente en 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limpiar intentos de login después de login exitoso
 */
const clearLoginAttempts = (identifier) => {
  // Esta función se puede implementar con Redis en producción
  console.log(`✅ Intentos de login limpiados para: ${identifier}`);
};

module.exports = {
  rateLimitLogin,
  rateLimitAPI,
  rateLimitStrict,
  clearLoginAttempts,
};
