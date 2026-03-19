const errorHandler = (error, _req, res, _next) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Errores de validación de Sequelize (campos inválidos)
  if (error.name === "SequelizeValidationError") {
    const errObj = {};
    error.errors.forEach((er) => {
      errObj[er.path] = er.message;
    });
    return res.status(400).json({
      success: false,
      message: "Error de validación en base de datos",
      errors: errObj,
    });
  }

  // Violación de clave foránea
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "El recurso relacionado no existe",
      error: isProduction ? undefined : error.parent?.detail,
    });
  }

  // Violación de clave única (duplicados)
  if (error.name === "SequelizeUniqueConstraintError") {
    const campo = error.errors?.[0]?.path || "campo";
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${campo}`,
    });
  }

  // Error genérico de base de datos
  if (error.name === "SequelizeDatabaseError") {
    return res.status(400).json({
      success: false,
      message: isProduction ? "Error en la base de datos" : error.message,
    });
  }

  // Error de conexión a DB
  if (error.name === "SequelizeConnectionError") {
    return res.status(503).json({
      success: false,
      message: "Servicio no disponible. Intente más tarde.",
    });
  }

  // Errores del negocio lanzados manualmente con statusCode
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Error genérico 500 (ocultar detalles en producción)
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: isProduction ? "Error interno del servidor" : error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
};

module.exports = errorHandler;