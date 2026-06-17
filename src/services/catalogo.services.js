const {
  ModeloLlanta,
  IndiceCarga,
  IndiceVelocidad,
  Temperatura,
  TipoLlanta,
  SentidoRotacion,
  MarcaLlanta,
} = require("../models");
const { NotFoundError, ConflictError } = require("../utils/customErrors");

class CatalogoLlantaService {
  // ─── Modelos de Llanta ──────────────────────────────────────────────────────

  async getAllModelosLlanta() {
    return ModeloLlanta.findAll({
      include: [{ model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre"] }],
      order: [["nombre", "ASC"]],
    });
  }

  async getModeloLlantaById(id) {
    const modelo = await ModeloLlanta.findByPk(id, {
      include: [{ model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre"] }],
    });
    if (!modelo) throw new NotFoundError("Modelo de llanta no encontrado");
    return modelo;
  }

  async createModeloLlanta(data) {
    const { idMarca, nombre } = data;
    const marca = await MarcaLlanta.findByPk(idMarca);
    if (!marca) throw new NotFoundError("Marca de llanta no encontrada");
    try {
      const modelo = await ModeloLlanta.create({ idMarca, nombre });
      return this.getModeloLlantaById(modelo.idModeloLlanta);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError("Ya existe un modelo con ese nombre para esta marca");
      }
      throw error;
    }
  }

  async updateModeloLlanta(id, data) {
    const modelo = await ModeloLlanta.findByPk(id);
    if (!modelo) throw new NotFoundError("Modelo de llanta no encontrado");
    await modelo.update(data);
    return this.getModeloLlantaById(id);
  }

  async deleteModeloLlanta(id) {
    const modelo = await ModeloLlanta.findByPk(id);
    if (!modelo) throw new NotFoundError("Modelo de llanta no encontrado");
    await modelo.destroy();
    return { idModeloLlanta: parseInt(id), message: "Modelo de llanta eliminado correctamente" };
  }

  // ─── Índices de Carga ───────────────────────────────────────────────────────

  async getAllIndicesCarga() {
    return IndiceCarga.findAll({ order: [["codigo", "ASC"]] });
  }

  async createIndiceCarga(data) {
    const { codigo } = data;
    try {
      return await IndiceCarga.create({ codigo });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(`El índice de carga '${codigo}' ya existe`);
      }
      throw error;
    }
  }

  async deleteIndiceCarga(id) {
    const item = await IndiceCarga.findByPk(id);
    if (!item) throw new NotFoundError("Índice de carga no encontrado");
    await item.destroy();
    return { idIndiceCarga: parseInt(id), message: "Índice de carga eliminado correctamente" };
  }

  // ─── Índices de Velocidad ───────────────────────────────────────────────────

  async getAllIndicesVelocidad() {
    return IndiceVelocidad.findAll({ order: [["codigo", "ASC"]] });
  }

  async createIndiceVelocidad(data) {
    const { codigo } = data;
    try {
      return await IndiceVelocidad.create({ codigo });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(`El índice de velocidad '${codigo}' ya existe`);
      }
      throw error;
    }
  }

  async deleteIndiceVelocidad(id) {
    const item = await IndiceVelocidad.findByPk(id);
    if (!item) throw new NotFoundError("Índice de velocidad no encontrado");
    await item.destroy();
    return { idIndiceVelocidad: parseInt(id), message: "Índice de velocidad eliminado correctamente" };
  }

  // ─── Temperaturas ───────────────────────────────────────────────────────────

  async getAllTemperaturas() {
    return Temperatura.findAll({ order: [["codigo", "ASC"]] });
  }

  async createTemperatura(data) {
    const { codigo } = data;
    try {
      return await Temperatura.create({ codigo });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(`La temperatura '${codigo}' ya existe`);
      }
      throw error;
    }
  }

  async deleteTemperatura(id) {
    const item = await Temperatura.findByPk(id);
    if (!item) throw new NotFoundError("Temperatura no encontrada");
    await item.destroy();
    return { idTemperatura: parseInt(id), message: "Temperatura eliminada correctamente" };
  }

  // ─── Tipos de Llanta ────────────────────────────────────────────────────────

  async getAllTiposLlanta() {
    return TipoLlanta.findAll({ order: [["descripcion", "ASC"]] });
  }

  async createTipoLlanta(data) {
    const { codigo, descripcion } = data;
    try {
      return await TipoLlanta.create({ codigo, descripcion });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(`El tipo de llanta '${codigo}' ya existe`);
      }
      throw error;
    }
  }

  async updateTipoLlanta(id, data) {
    const item = await TipoLlanta.findByPk(id);
    if (!item) throw new NotFoundError("Tipo de llanta no encontrado");
    await item.update(data);
    return item;
  }

  async deleteTipoLlanta(id) {
    const item = await TipoLlanta.findByPk(id);
    if (!item) throw new NotFoundError("Tipo de llanta no encontrado");
    await item.destroy();
    return { idTipoLlanta: parseInt(id), message: "Tipo de llanta eliminado correctamente" };
  }

  // ─── Sentidos de Rotación ───────────────────────────────────────────────────

  async getAllSentidosRotacion() {
    return SentidoRotacion.findAll({ order: [["descripcion", "ASC"]] });
  }

  async createSentidoRotacion(data) {
    const { descripcion } = data;
    try {
      return await SentidoRotacion.create({ descripcion });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ConflictError(`El sentido de rotación '${descripcion}' ya existe`);
      }
      throw error;
    }
  }

  async deleteSentidoRotacion(id) {
    const item = await SentidoRotacion.findByPk(id);
    if (!item) throw new NotFoundError("Sentido de rotación no encontrado");
    await item.destroy();
    return { idSentidoRotacion: parseInt(id), message: "Sentido de rotación eliminado correctamente" };
  }

  // ─── Endpoint especial: todos los catálogos en un solo request ──────────────
  // (para llenar selects del formulario de producto en el admin)
  async getAllCatalogos() {
    const [indicesCarga, indicesVelocidad, temperaturas, tiposLlanta, sentidosRotacion] =
      await Promise.all([
        this.getAllIndicesCarga(),
        this.getAllIndicesVelocidad(),
        this.getAllTemperaturas(),
        this.getAllTiposLlanta(),
        this.getAllSentidosRotacion(),
      ]);

    return {
      indicesCarga,
      indicesVelocidad,
      temperaturas,
      tiposLlanta,
      sentidosRotacion,
    };
  }
}

module.exports = new CatalogoLlantaService();
