const {
  Llanta,
  MarcaLlanta,
  ModeloLlanta,
  IndiceCarga,
  IndiceVelocidad,
  Temperatura,
  TipoLlanta,
  SentidoRotacion,
  Producto,
  ImagenProducto,
  Compatibilidad,
  ModeloVehiculo,
  MarcaVehiculo,
} = require("../models");
const { NotFoundError } = require("../utils/customErrors");
const { Op } = require("sequelize");
const sequelize = require("../models").sequelize; // Asumiendo que sequelize está exportado en index.js

// ─── Include estándar — llanta pública (catálogo) ────────────────────────────
const defaultInclude = [
  {
    model: Producto,
    as: "producto",
    attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock", "activo", "destacado", "descripcion"],
    include: [
      {
        model: ImagenProducto,
        as: "imagenes",
        where: { tipoImagen: "PRINCIPAL" },
        required: false,
        attributes: ["idImagen", "urlImagen", "orden"],
      },
    ],
  },
  {
    model: MarcaLlanta,
    as: "marca",
    attributes: ["idMarca", "nombre", "logoUrl"],
  },
];

// ─── Include extendido — detalle completo ────────────────────────────────────
const fullInclude = [
  {
    model: Producto,
    as: "producto",
    include: [
      {
        model: ImagenProducto,
        as: "imagenes",
        order: [["orden", "ASC"]],
      },
    ],
  },
  { model: MarcaLlanta, as: "marca" },
  { model: ModeloLlanta, as: "modeloLlanta" },
  { model: IndiceCarga, as: "indiceCarga" },
  { model: IndiceVelocidad, as: "indiceVelocidad" },
  { model: Temperatura, as: "temperatura" },
  { model: TipoLlanta, as: "tipoLlanta" },
  { model: SentidoRotacion, as: "sentidoRotacion" },
];

class LlantaService {
  // Obtener todas las llantas (catálogo público)
  async getAllLlantas(filters = {}) {
    const where = {};
    const productoWhere = { activo: true };

    if (filters.destacado === true || filters.destacado === "true") productoWhere.destacado = true;
    if (filters.idMarca) where.idMarca = filters.idMarca;
    if (filters.ancho) where.ancho = filters.ancho;
    if (filters.perfil) where.perfil = filters.perfil;
    if (filters.rin) where.rin = filters.rin;
    if (filters.idTipoLlanta) where.idTipoLlanta = filters.idTipoLlanta;

    return Llanta.findAll({
      where,
      include: [
        {
          model: Producto,
          as: "producto",
          where: productoWhere,
          attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock", "activo", "destacado"],
          include: [
            {
              model: ImagenProducto,
              as: "imagenes",
              where: { tipoImagen: "PRINCIPAL" },
              required: false,
              attributes: ["idImagen", "urlImagen"],
            },
          ],
        },
        { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
      ],
      order: [["idLlanta", "ASC"]],
    });
  }

  // Obtener llanta por ID (detalle completo)
  async getLlantaById(id) {
    const llanta = await Llanta.findByPk(id, { include: fullInclude });
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    return llanta;
  }

  // Buscar por medida exacta (ancho / perfil / rin)
  async buscarPorMedida(ancho, perfil, rin) {
    return Llanta.findAll({
      where: { ancho, perfil, rin },
      include: [
        {
          model: Producto,
          as: "producto",
          where: { activo: true, stock: { [Op.gt]: 0 } },
          attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock"],
          include: [
            {
              model: ImagenProducto,
              as: "imagenes",
              where: { tipoImagen: "PRINCIPAL" },
              required: false,
              attributes: ["urlImagen"],
            },
          ],
        },
        { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
      ],
      order: [["$producto.precio$", "ASC"]],
    });
  }

  // Buscar por vehículo (marca / modelo / año) — por texto (retrocompatibilidad)
  async buscarPorVehiculo(marcaVehiculo, modeloVehiculo, anio) {
    return Llanta.findAll({
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
          model: Producto,
          as: "producto",
          where: { activo: true, stock: { [Op.gt]: 0 } },
          attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock"],
          include: [
            {
              model: ImagenProducto,
              as: "imagenes",
              where: { tipoImagen: "PRINCIPAL" },
              required: false,
              attributes: ["urlImagen"],
            },
          ],
        },
        { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
      ],
    });
  }

  /**
   * Búsqueda general por texto libre.
   * Detecta medida tipo "185/65R14" o busca por marca/descripción.
   */
  async buscarGeneral(q) {
    const query = (q || "").trim();
    if (!query) return { resultados: [], tipo: "vacio", parsedMedida: null, marcaBuscada: null };

    // ── Intentar parsear medida ──────────────────────────────────────────────
    const medidaRegex = /(\d{3})\s*[\/\-]\s*(\d{2})\s*[Rr]?\s*(\d{2})/;
    const medidaMatch = query.match(medidaRegex);

    if (medidaMatch) {
      const ancho = parseInt(medidaMatch[1]);
      const perfil = parseInt(medidaMatch[2]);
      const rin = parseInt(medidaMatch[3]);

      const restoQuery = query.replace(medidaRegex, "").trim();
      const tieneMarca = restoQuery.length > 0;

      const marcaInclude = tieneMarca
        ? { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"], where: { nombre: { [Op.iLike]: `%${restoQuery}%` } }, required: true }
        : { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] };

      const resultados = await Llanta.findAll({
        where: { ancho, perfil, rin },
        include: [
          {
            model: Producto,
            as: "producto",
            where: { activo: true },
            attributes: ["idProducto", "nombre", "precio", "precioOferta", "stock"],
            include: [
              { model: ImagenProducto, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false, attributes: ["urlImagen"] },
            ],
          },
          marcaInclude,
        ],
      });

      return {
        resultados,
        tipo: "medida",
        parsedMedida: { ancho, perfil, rin },
        marcaBuscada: tieneMarca ? restoQuery : null,
      };
    }

    // ── Búsqueda por texto libre ─────────────────────────────────────────────
    const [porNombre, porMarca] = await Promise.all([
      Llanta.findAll({
        include: [
          {
            model: Producto,
            as: "producto",
            where: {
              activo: true,
              [Op.or]: [
                { nombre: { [Op.iLike]: `%${query}%` } },
                { descripcion: { [Op.iLike]: `%${query}%` } },
              ],
            },
            include: [
              { model: ImagenProducto, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false, attributes: ["urlImagen"] },
            ],
          },
          { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"], required: false },
        ],
      }),
      Llanta.findAll({
        include: [
          {
            model: Producto,
            as: "producto",
            where: { activo: true },
            include: [
              { model: ImagenProducto, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false, attributes: ["urlImagen"] },
            ],
          },
          {
            model: MarcaLlanta,
            as: "marca",
            attributes: ["idMarca", "nombre", "logoUrl"],
            where: { nombre: { [Op.iLike]: `%${query}%` } },
            required: true,
          },
        ],
      }),
    ]);

    // Deduplicar por idLlanta
    const seen = new Set();
    const combinados = [...porNombre, ...porMarca].filter((l) => {
      if (seen.has(l.idLlanta)) return false;
      seen.add(l.idLlanta);
      return true;
    });

    return { resultados: combinados, tipo: "texto", parsedMedida: null, marcaBuscada: null };
  }

  /**
   * Recomendaciones: dado un rin y lista de IDs a excluir,
   * devuelve primero las que tienen oferta, luego el resto.
   */
  async obtenerRecomendaciones({ rin, excluirIds = [], limit = 8 }) {
    const excluir = Array.isArray(excluirIds) ? excluirIds : [];
    const llantaWhere = {};
    const productoWhere = { activo: true, stock: { [Op.gt]: 0 } };
    if (rin) llantaWhere.rin = rin;
    if (excluir.length > 0) llantaWhere.idLlanta = { [Op.notIn]: excluir };

    const conOferta = await Llanta.findAll({
      where: llantaWhere,
      include: [
        {
          model: Producto,
          as: "producto",
          where: { ...productoWhere, precioOferta: { [Op.ne]: null } },
          include: [{ model: ImagenProducto, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false, attributes: ["urlImagen"] }],
        },
        { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
      ],
      limit,
    });

    if (conOferta.length >= limit) return conOferta.slice(0, limit);

    const idsUsados = conOferta.map((l) => l.idLlanta);
    const whereRelleno = { ...llantaWhere };
    if ([...excluir, ...idsUsados].length > 0)
      whereRelleno.idLlanta = { [Op.notIn]: [...excluir, ...idsUsados] };

    const relleno = await Llanta.findAll({
      where: whereRelleno,
      include: [
        {
          model: Producto,
          as: "producto",
          where: productoWhere,
          include: [{ model: ImagenProducto, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false, attributes: ["urlImagen"] }],
        },
        { model: MarcaLlanta, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
      ],
      limit: limit - conOferta.length,
    });

    return [...conOferta, ...relleno].slice(0, limit);
  }

  // Crear llanta (Admin) — recibe data de llanta + producto juntos
  async createLlanta(data) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Crear producto base
      const producto = await Producto.create({
        tipoProducto: "LLANTA",
        nombre: data.nombre,
        precio: data.precio,
        precioOferta: data.precioOferta,
        stock: data.stock,
        descripcion: data.descripcion,
        activo: data.activo !== undefined ? data.activo : true,
        destacado: data.destacado || false,
      }, { transaction });

      // 2. Crear llanta asociada
      const llanta = await Llanta.create({
        ...data,
        idProducto: producto.idProducto,
      }, { transaction });

      await transaction.commit();
      return this.getLlantaById(llanta.idLlanta);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Actualizar llanta (Admin)
  async updateLlanta(id, data) {
    const llanta = await Llanta.findByPk(id, { include: [{ model: Producto, as: "producto" }] });
    if (!llanta) throw new NotFoundError("Llanta no encontrada");

    const transaction = await sequelize.transaction();
    try {
      // 1. Actualizar producto si hay campos relevantes
      if (llanta.producto) {
        const productoData = {};
        if (data.nombre !== undefined) productoData.nombre = data.nombre;
        if (data.precio !== undefined) productoData.precio = data.precio;
        if (data.precioOferta !== undefined) productoData.precioOferta = data.precioOferta;
        if (data.stock !== undefined) productoData.stock = data.stock;
        if (data.descripcion !== undefined) productoData.descripcion = data.descripcion;
        if (data.activo !== undefined) productoData.activo = data.activo;
        if (data.destacado !== undefined) productoData.destacado = data.destacado;

        if (Object.keys(productoData).length > 0) {
          await llanta.producto.update(productoData, { transaction });
        }
      }

      // 2. Actualizar llanta
      await llanta.update(data, { transaction });

      await transaction.commit();
      return this.getLlantaById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Eliminar llanta (soft delete en Producto)
  async deleteLlanta(id) {
    const llanta = await Llanta.findByPk(id, { include: [{ model: Producto, as: "producto" }] });
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    if (llanta.producto) {
      await llanta.producto.update({ activo: false });
    }
    return { message: "Llanta desactivada correctamente" };
  }
}

module.exports = new LlantaService();
