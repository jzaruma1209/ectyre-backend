const {
  Llanta,
  MarcaLlanta,
  ImagenLlanta,
  Compatibilidad,
  ModeloVehiculo,
  MarcaVehiculo,
} = require("../models");
const { NotFoundError } = require("../utils/customErrors");
const { Op } = require("sequelize");

class LlantaService {
  // Obtener todas las llantas
  async getAllLlantas(filters = {}) {
    const where = { activo: true };

    // Filtros opcionales
    if (filters.destacado) where.destacado = true;
    if (filters.idMarca) where.idMarca = filters.idMarca;
    if (filters.ancho) where.ancho = filters.ancho;
    if (filters.perfil) where.perfil = filters.perfil;
    if (filters.rin) where.rin = filters.rin;

    const llantas = await Llanta.findAll({
      where,
      include: [
        {
          model: MarcaLlanta,
          as: "marca",
          attributes: ["idMarca", "nombre", "logoUrl"],
        },
        {
          model: ImagenLlanta,
          as: "imagenes",
          where: { tipoImagen: "PRINCIPAL" },
          required: false,
        },
      ],
      order: [
        ["destacado", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return llantas;
  }

  // Obtener llanta por ID
  async getLlantaById(id) {
    const llanta = await Llanta.findByPk(id, {
      include: [
        {
          model: MarcaLlanta,
          as: "marca",
        },
        {
          model: ImagenLlanta,
          as: "imagenes",
          order: [["orden", "ASC"]],
        },
      ],
    });

    if (!llanta) {
      throw new NotFoundError("Llanta no encontrada");
    }

    return llanta;
  }

  // Buscar por medida
  async buscarPorMedida(ancho, perfil, rin) {
    const llantas = await Llanta.findAll({
      where: {
        ancho,
        perfil,
        rin,
        activo: true,
        stock: { [Op.gt]: 0 },
      },
      include: [
        {
          model: MarcaLlanta,
          as: "marca",
        },
        {
          model: ImagenLlanta,
          as: "imagenes",
          where: { tipoImagen: "PRINCIPAL" },
          required: false,
        },
      ],
    });

    return llantas;
  }

  // Buscar por vehículo
  async buscarPorVehiculo(marcaVehiculo, modeloVehiculo, anio) {
    const llantas = await Llanta.findAll({
      include: [
        {
          model: Compatibilidad,
          as: "compatibilidades",
          required: true,
          where: {
            anioDesde: { [Op.lte]: anio },
            [Op.or]: [{ anioHasta: { [Op.gte]: anio } }, { anioHasta: null }],
          },
          include: [
            {
              model: ModeloVehiculo,
              as: "modelo",
              required: true,
              where: { nombre: { [Op.iLike]: `%${modeloVehiculo}%` } },
              include: [
                {
                  model: MarcaVehiculo,
                  as: "marca",
                  required: true,
                  where: { nombre: { [Op.iLike]: `%${marcaVehiculo}%` } },
                },
              ],
            },
          ],
        },
        {
          model: MarcaLlanta,
          as: "marca",
        },
        {
          model: ImagenLlanta,
          as: "imagenes",
          where: { tipoImagen: "PRINCIPAL" },
          required: false,
        },
      ],
      where: {
        activo: true,
        stock: { [Op.gt]: 0 },
      },
    });

    return llantas;
  }

  // Crear llanta
  async createLlanta(data) {
    const llanta = await Llanta.create(data);
    return llanta;
  }

  // Actualizar llanta
  async updateLlanta(id, data) {
    const llanta = await Llanta.findByPk(id);

    if (!llanta) {
      throw new NotFoundError("Llanta no encontrada");
    }

    await llanta.update(data);
    return llanta;
  }

  // Eliminar llanta (soft delete)
  async deleteLlanta(id) {
    const llanta = await Llanta.findByPk(id);

    if (!llanta) {
      throw new NotFoundError("Llanta no encontrada");
    }

    await llanta.update({ activo: false });
    return { message: "Llanta eliminada correctamente" };
  }
}

module.exports = new LlantaService();
