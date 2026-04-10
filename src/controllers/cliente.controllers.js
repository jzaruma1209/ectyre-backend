const clienteService = require("../services/cliente.services");
const catchError = require("../utils/catchError");
const { blacklistToken } = require("../middlewares/auth.middleware");


// Registro de cliente (incluye token para auto-login)
const registrarCliente = catchError(async (req, res) => {
  const resultado = await clienteService.registrarCliente(req.body);

  res.status(201).json({
    success: true,
    message: "¡Cuenta creada exitosamente! Sesión iniciada.",
    data: resultado,
  });
});

// Login de cliente
const loginCliente = catchError(async (req, res) => {
  const { email, password } = req.body;
  const resultado = await clienteService.loginCliente(email, password);

  res.status(200).json({
    success: true,
    message: "Login exitoso",
    data: resultado,
  });
});

// Obtener perfil del cliente autenticado
const getPerfilCliente = catchError(async (req, res) => {
  const idCliente = req.user.idCliente;
  const perfil = await clienteService.getClientePerfil(idCliente);

  res.status(200).json({
    success: true,
    message: "Perfil obtenido correctamente",
    data: perfil,
  });
});

// Actualizar perfil del cliente autenticado
const updatePerfilCliente = catchError(async (req, res) => {
  const idCliente = req.user.idCliente;
  const perfil = await clienteService.updateClientePerfil(idCliente, req.body);

  res.status(200).json({
    success: true,
    message: "Perfil actualizado correctamente",
    data: perfil,
  });
});

// Logout (invalidar token)
const logoutCliente = catchError(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    blacklistToken(token);
  }

  res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente",
  });
});

module.exports = {
  registrarCliente,
  loginCliente,
  logoutCliente,
  getPerfilCliente,
  updatePerfilCliente,
};


