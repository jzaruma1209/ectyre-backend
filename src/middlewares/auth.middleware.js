const jwt = require("jsonwebtoken");

/**
 * Middleware para verificar token JWT
 * Extrae el token del header Authorization y verifica su validez
 */
const verifyJWT = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado. Debe incluir Authorization header",
      });
    }

    // Verificar formato Bearer token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido. Use: Bearer <token>",
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // Agregar usuario decodificado al request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al verificar token",
      error: error.message,
    });
  }
};

/**
 * Middleware para verificar que el usuario tiene rol de administrador
 * Debe usarse DESPUÉS de verifyJWT
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere rol de administrador",
    });
  }

  next();
};

module.exports = { verifyJWT, isAdmin };
