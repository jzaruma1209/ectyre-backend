const clienteService = require("../services/cliente.services");
const catchError = require("../utils/catchError");
const { clearLoginAttempts } = require("../middlewares/rateLimit.middleware");

// Registro de cliente
const registrarCliente = catchError(async (req, res) => {
  const cliente = await clienteService.registrarCliente(req.body);

  res.status(201).json({
    success: true,
    message: "Cliente registrado correctamente",
    data: cliente,
  });
});

// Login de cliente
const loginCliente = catchError(async (req, res) => {
  const { email, password } = req.body;
  const resultado = await clienteService.loginCliente(email, password);

  clearLoginAttempts(email);

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

module.exports = {
  registrarCliente,
  loginCliente,
  getPerfilCliente,
  updatePerfilCliente,
};
