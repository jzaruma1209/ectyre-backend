// Custom Error Classes para manejo de errores HTTP específicos
// Patrón usado en empresas como Facebook, Google, Airbnb

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Datos inválidos") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflicto en la solicitud") {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
