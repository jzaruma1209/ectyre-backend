// Exportar todos los middlewares desde un solo lugar
const { verifyJWT, isAdmin } = require("./auth.middleware");
const {
  validate,
  validateLlantaData,
  validateClienteData,
  validateLoginData,
  validatePedidoData,
  validateCarritoItem,
  validateId,
  validateDireccionData,
} = require("./validation.middleware");
const {
  rateLimitLogin,
  rateLimitAPI,
  rateLimitStrict,
  clearLoginAttempts,
} = require("./rateLimit.middleware");

module.exports = {
  // Autenticación
  verifyJWT,
  isAdmin,

  // Validaciones
  validate,
  validateLlantaData,
  validateClienteData,
  validateLoginData,
  validatePedidoData,
  validateCarritoItem,
  validateId,
  validateDireccionData,

  // Rate Limiting
  rateLimitLogin,
  rateLimitAPI,
  rateLimitStrict,
  clearLoginAttempts,
};
