const { Compatibilidad, Producto, ModeloVehiculo, MarcaVehiculo } = require("../models");
const { NotFoundError, ConflictError } = require("../utils/customErrors");
const { Op } = require("sequelize");
const { includeProductoCompleto, serializarProducto } = require("../utils/productoHelpers");

class CompatibilidadService {
  // ─── Productos compatibles con un vehículo ─────────────────────────────────
  async getProductosByVehiculo({ idModelo, anio }) {
    const modelo = await ModeloVehiculo.findByPk(idModelo, {
      include: [{ model: MarcaVehiculo, as: "marca", attributes: ["nombre"] }],
    });
    if (!modelo) throw new NotFoundError("Modelo de vehículo no encontrado");

    const compatibilidades = await Compatibilidad.findAll({
      where: {
        idModelo,
        anioDesde: { [Op.lte]: anio },
        [Op.or]: [{ anioHasta: { [Op.gte]: anio } }, { anioHasta: null }],
      },
      include: [
        {
          model: Producto,
          as: "producto",
          required: true,
          where: { activo: true },
          include: includeProductoCompleto(),
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
      productos: compatibilidades.map((c) => ({
        idCompatibilidad: c.idCompatibilidad,
        esOriginal: c.esOriginal,
        anioDesde: c.anioDesde,
        anioHasta: c.anioHasta,
        producto: serializarProducto(c.producto),
      })),
    };
  }

  // ─── Vehículos compatibles con un producto ─────────────────────────────────
  async getVehiculosByProducto(idProducto) {
    const producto = await Producto.findByPk(idProducto);
    if (!producto) throw new NotFoundError("Producto no encontrado");

    const compatibilidades = await Compatibilidad.findAll({
      where: { idProducto },
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
      idProducto: Number(idProducto),
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
        { model: Producto, as: "producto", attributes: ["idProducto", "nombre"] },
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
    const { idProducto, idModelo, anioDesde, anioHasta, esOriginal } = data;

    const [producto, modelo] = await Promise.all([
      Producto.findByPk(idProducto),
      ModeloVehiculo.findByPk(idModelo),
    ]);
    if (!producto) throw new NotFoundError("Producto no encontrado");
    if (!modelo) throw new NotFoundError("Modelo de vehículo no encontrado");

    try {
      const comp = await Compatibilidad.create({ idProducto, idModelo, anioDesde, anioHasta, esOriginal });
      return this.getCompatibilidadById(comp.idCompatibilidad);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Ya existe esta compatibilidad producto-vehículo-año");
      }
      throw error;
    }
  }

  // ─── Actualizar compatibilidad (Admin) ─────────────────────────────────────
  async updateCompatibilidad(id, data) {
    const comp = await Compatibilidad.findByPk(id);
    if (!comp) throw new NotFoundError("Compatibilidad no encontrada");
    const { idProducto, idModelo, anioDesde, anioHasta, esOriginal } = data;
    await comp.update({ idProducto, idModelo, anioDesde, anioHasta, esOriginal });
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
