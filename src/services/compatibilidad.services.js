const {
  Compatibilidad,
  Llanta,
  ModeloVehiculo,
  MarcaVehiculo,
  MarcaLlanta,
  Producto,
  ImagenProducto,
} = require("../models");
const { NotFoundError, ConflictError } = require("../utils/customErrors");
const { Op } = require("sequelize");

// Include estándar para llantas con producto anidado
const llantaConProducto = [
  {
    model: Producto,
    as: "producto",
    attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock", "activo"],
    include: [
      {
        model: ImagenProducto,
        as: "imagenes",
        where: { tipoImagen: "PRINCIPAL" },
        required: false,
        attributes: ["urlImagen"],
        limit: 1,
      },
    ],
  },
  { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre"] },
];

class CompatibilidadService {
  // ─── Llantas compatibles con un vehículo ───────────────────────────────────
  async getLlantasByVehiculo({ idModelo, anio }) {
    const modelo = await ModeloVehiculo.findByPk(idModelo, {
      include: [{ model: MarcaVehiculo, as: "marca", attributes: ["nombre"] }],
    });
    if (!modelo) throw new NotFoundError("Modelo de vehículo no encontrado");

    const where = {
      idModelo,
      anioDesde: { [Op.lte]: anio },
      [Op.or]: [{ anioHasta: { [Op.gte]: anio } }, { anioHasta: null }],
    };

    const compatibilidades = await Compatibilidad.findAll({
      where,
      include: [
        {
          model: Llanta,
          as: "llanta",
          include: llantaConProducto,
        },
      ],
      order: [["esOriginal", "DESC"]],
    });

    return {
      vehiculo: {
        idModelo: modelo.idModelo,
        nombre: modelo.nombre,
        tipoVehiculo: modelo.tipoVehiculo,
        marca: modelo.marca,
      },
      anio,
      totalCompatibles: compatibilidades.length,
      llantas: compatibilidades.map((c) => ({
        idCompatibilidad: c.idCompatibilidad,
        esOriginal: c.esOriginal,
        anioDesde: c.anioDesde,
        anioHasta: c.anioHasta,
        llanta: c.llanta,
      })),
    };
  }

  // ─── Vehículos compatibles con una llanta ──────────────────────────────────
  async getVehiculosByLlanta(idLlanta) {
    const llanta = await Llanta.findByPk(idLlanta);
    if (!llanta) throw new NotFoundError("Llanta no encontrada");

    const compatibilidades = await Compatibilidad.findAll({
      where: { idLlanta },
      include: [
        {
          model: ModeloVehiculo,
          as: "modelo",
          include: [{ model: MarcaVehiculo, as: "marca", attributes: ["idMarcaVehiculo", "nombre"] }],
        },
      ],
      order: [["esOriginal", "DESC"]],
    });

    return {
      idLlanta,
      totalVehiculos: compatibilidades.length,
      vehiculos: compatibilidades.map((c) => ({
        idCompatibilidad: c.idCompatibilidad,
        esOriginal: c.esOriginal,
        anioDesde: c.anioDesde,
        anioHasta: c.anioHasta,
        modelo: c.modelo,
      })),
    };
  }

  // ─── Obtener compatibilidad por ID ─────────────────────────────────────────
  async getCompatibilidadById(id) {
    const comp = await Compatibilidad.findByPk(id, {
      include: [
        {
          model: Llanta,
          as: "llanta",
          include: [{ model: MarcaLlanta, as: "marca", attributes: ["nombre"] }],
        },
        {
          model: ModeloVehiculo,
          as: "modelo",
          include: [{ model: MarcaVehiculo, as: "marca", attributes: ["nombre"] }],
        },
      ],
    });
    if (!comp) throw new NotFoundError("Compatibilidad no encontrada");
    return comp;
  }

  // ─── Crear compatibilidad (Admin) ───────────────────────────────────────────
  async createCompatibilidad(data) {
    const { idLlanta, idModelo, anioDesde, anioHasta, esOriginal } = data;

    const [llanta, modelo] = await Promise.all([
      Llanta.findByPk(idLlanta),
      ModeloVehiculo.findByPk(idModelo),
    ]);
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    if (!modelo) throw new NotFoundError("Modelo de vehículo no encontrado");

    try {
      const comp = await Compatibilidad.create({ idLlanta, idModelo, anioDesde, anioHasta, esOriginal });
      return this.getCompatibilidadById(comp.idCompatibilidad);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Ya existe esta compatibilidad llanta-vehículo-año");
      }
      throw error;
    }
  }

  // ─── Actualizar compatibilidad (Admin) ─────────────────────────────────────
  async updateCompatibilidad(id, data) {
    const comp = await Compatibilidad.findByPk(id);
    if (!comp) throw new NotFoundError("Compatibilidad no encontrada");
    await comp.update(data);
    return this.getCompatibilidadById(id);
  }

  // ─── Eliminar compatibilidad (Admin) ───────────────────────────────────────
  async deleteCompatibilidad(id) {
    const comp = await Compatibilidad.findByPk(id);
    if (!comp) throw new NotFoundError("Compatibilidad no encontrada");
    await comp.destroy();
    return { idCompatibilidad: parseInt(id), message: "Compatibilidad eliminada correctamente" };
  }
}

module.exports = new CompatibilidadService();
