// Exportar todos los middlewares desde un solo lugar
const { verifyJWT, isAdmin } = require("./auth.middleware");
const {
  validate,
  validateClienteData,
  validateLoginData,
  validatePedidoData,
  validateCarritoItem,
  validateId,
  validateDireccionData,
} = require("./validation.middleware");
const {
  rateLimitAPI,
  rateLimitLogin,
  rateLimitStrict,
  rateLimitRegistro,
} = require("./rateLimit.middleware");

module.exports = {
  // Autenticación
  verifyJWT,
  isAdmin,

  // Validaciones
  validate,
  validateClienteData,
  validateLoginData,
  validatePedidoData,
  validateCarritoItem,
  validateId,
  validateDireccionData,

  // Rate Limiting
  rateLimitAPI,
  rateLimitLogin,
  rateLimitStrict,
  rateLimitRegistro,
};
