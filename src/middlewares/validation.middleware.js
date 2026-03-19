const { body, param, validationResult } = require("express-validator");

/**
 * Middleware genérico para validar resultados de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validaciones para Llantas
 */
const validateLlantaData = [
  body("idMarca")
    .notEmpty()
    .withMessage("La marca es requerida")
    .isInt()
    .withMessage("ID de marca inválido"),
  body("modelo")
    .notEmpty()
    .withMessage("El modelo es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("Modelo debe tener entre 2 y 100 caracteres"),
  body("ancho")
    .notEmpty()
    .withMessage("El ancho es requerido")
    .isInt({ min: 100, max: 400 })
    .withMessage("Ancho debe estar entre 100 y 400"),
  body("perfil")
    .notEmpty()
    .withMessage("El perfil es requerido")
    .isInt({ min: 25, max: 100 })
    .withMessage("Perfil debe estar entre 25 y 100"),
  body("rin")
    .notEmpty()
    .withMessage("El rin es requerido")
    .isInt({ min: 10, max: 30 })
    .withMessage("Rin debe estar entre 10 y 30"),
  body("precio")
    .notEmpty()
    .withMessage("El precio es requerido")
    .isDecimal()
    .withMessage("Precio debe ser un número decimal"),
  body("stock")
    .notEmpty()
    .withMessage("El stock es requerido")
    .isInt({ min: 0 })
    .withMessage("Stock debe ser mayor o igual a 0"),
  validate,
];

/**
 * Validaciones para Cliente (Registro)
 */
const validateClienteData = [
  body("tipoIdentificacion")
    .notEmpty()
    .withMessage("Tipo de identificación requerido")
    .isIn(["CEDULA", "RUC", "PASAPORTE"])
    .withMessage("Tipo de identificación inválido"),
  body("numeroIdentificacion")
    .notEmpty()
    .withMessage("Número de identificación requerido")
    .isLength({ min: 5, max: 20 })
    .withMessage("Número de identificación inválido"),
  body("nombres")
    .notEmpty()
    .withMessage("Los nombres son requeridos")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nombres deben tener entre 2 y 100 caracteres"),
  body("apellidos")
    .notEmpty()
    .withMessage("Los apellidos son requeridos")
    .isLength({ min: 2, max: 100 })
    .withMessage("Apellidos deben tener entre 2 y 100 caracteres"),
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  body("telefono")
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .isLength({ min: 7, max: 15 })
    .withMessage("Teléfono inválido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("Contraseña debe tener al menos 6 caracteres"),
  validate,
];

/**
 * Validaciones para Login
 */
const validateLoginData = [
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  validate,
];

/**
 * Validaciones para Pedido
 */
const validatePedidoData = [
  body("idDireccionEntrega")
    .notEmpty()
    .withMessage("La dirección de entrega es requerida")
    .isInt()
    .withMessage("ID de dirección inválido"),
  body("requiereInstalacion")
    .optional()
    .isBoolean()
    .withMessage("Requiere instalación debe ser true o false"),
  validate,
];

/**
 * Validaciones para agregar al carrito
 */
const validateCarritoItem = [
  body("idLlanta")
    .notEmpty()
    .withMessage("El ID de llanta es requerido")
    .isInt()
    .withMessage("ID de llanta inválido"),
  body("cantidad")
    .notEmpty()
    .withMessage("La cantidad es requerida")
    .isInt({ min: 1 })
    .withMessage("Cantidad debe ser mayor a 0"),
  validate,
];

/**
 * Validación de ID en parámetros
 */
const validateId = [param("id").isInt().withMessage("ID inválido"), validate];

/**
 * Validaciones para Dirección
 */
const validateDireccionData = [
  body("provincia")
    .notEmpty()
    .withMessage("La provincia es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("Provincia debe tener entre 2 y 100 caracteres"),
  body("ciudad")
    .notEmpty()
    .withMessage("La ciudad es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("Ciudad debe tener entre 2 y 100 caracteres"),
  body("direccionCompleta")
    .notEmpty()
    .withMessage("La dirección completa es requerida")
    .isLength({ min: 5 })
    .withMessage("Dirección debe tener al menos 5 caracteres"),
  body("referencia")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Referencia demasiado larga"),
  body("esPrincipal")
    .optional()
    .isBoolean()
    .withMessage("esPrincipal debe ser true o false"),
  validate,
];

module.exports = {
  validate,
  validateLlantaData,
  validateClienteData,
  validateLoginData,
  validatePedidoData,
  validateCarritoItem,
  validateId,
  validateDireccionData,
};
