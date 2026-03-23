const { Cliente, Direccion } = require("../models");
const {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/customErrors");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

class ClienteService {
  // Registrar cliente
  async registrarCliente(data) {
    // Verificar si el email ya existe
    const existeEmail = await Cliente.findOne({ where: { email: data.email } });
    if (existeEmail) {
      throw new ConflictError("El email ya está registrado");
    }

    // Verificar si la identificación ya existe
    const existeIdentificacion = await Cliente.findOne({
      where: { numeroIdentificacion: data.numeroIdentificacion },
    });
    if (existeIdentificacion) {
      throw new ConflictError("La identificación ya está registrada");
    }

    // Crear cliente (el hook beforeCreate encriptará la contraseña)
    const cliente = await Cliente.create({
      ...data,
      passwordHash: data.password,
    });

    // No devolver el password
    const clienteData = cliente.toJSON();
    delete clienteData.passwordHash;

    return clienteData;
  }

  // Login
  async loginCliente(email, password) {
    const cliente = await Cliente.findOne({ where: { email, activo: true } });

    if (!cliente) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Comparar contraseña
    const passwordValido = await cliente.comparePassword(password);
    if (!passwordValido) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        idCliente: cliente.idCliente,
        email: cliente.email,
        nombres: cliente.nombres,
        role: cliente.role,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const clienteData = cliente.toJSON();
    delete clienteData.passwordHash;

    return {
      cliente: clienteData,
      token,
    };
  }

  // Obtener perfil
  async getClientePerfil(idCliente) {
    const cliente = await Cliente.findByPk(idCliente, {
      include: [
        {
          model: Direccion,
          as: "direcciones",
        },
      ],
      attributes: { exclude: ["passwordHash"] },
    });

    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    return cliente;
  }

  // Actualizar perfil
  async updateClientePerfil(idCliente, data) {
    const cliente = await Cliente.findByPk(idCliente);

    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }

    // No permitir actualizar email si ya existe en otro cliente
    if (data.email && data.email !== cliente.email) {
      const existeEmail = await Cliente.findOne({
        where: { email: data.email, idCliente: { [Op.ne]: idCliente } },
      });
      if (existeEmail) {
        throw new ConflictError("El email ya está registrado");
      }
    }

    await cliente.update(data);

    const clienteData = cliente.toJSON();
    delete clienteData.passwordHash;

    return clienteData;
  }
}

module.exports = new ClienteService();
