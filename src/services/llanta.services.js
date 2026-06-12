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

// Include estándar para cualquier búsqueda
const defaultInclude = [
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
];

class LlantaService {
  // Obtener todas las llantas
  async getAllLlantas(filters = {}) {
    const where = { activo: true };

    if (filters.destacado) where.destacado = true;
    if (filters.idMarca) where.idMarca = filters.idMarca;
    if (filters.ancho) where.ancho = filters.ancho;
    if (filters.perfil) where.perfil = filters.perfil;
    if (filters.rin) where.rin = filters.rin;

    /* return Llanta.findAll({
       where,
       include: defaultInclude,
       order: [
         ["destacado", "DESC"],
         ["createdAt", "DESC"],
       ],
     }); */
    return Llanta.findAll({
      where,
      include: defaultInclude,
      order: [["idLlanta", "ASC"]],
    });
  }

  // Obtener llanta por ID
  async getLlantaById(id) {
    const llanta = await Llanta.findByPk(id, {
      include: [
        { model: MarcaLlanta, as: "marca" },
        { model: ImagenLlanta, as: "imagenes", order: [["orden", "ASC"]] },
      ],
    });
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    return llanta;
  }

  // Buscar por medida exacta (ancho / perfil / rin)
  async buscarPorMedida(ancho, perfil, rin) {
    return Llanta.findAll({
      where: { ancho, perfil, rin, activo: true, stock: { [Op.gt]: 0 } },
      include: defaultInclude,
      order: [["precio", "ASC"]],
    });
  }

  // Buscar por vehículo (marca / modelo / año)
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
        ...defaultInclude,
      ],
      where: { activo: true, stock: { [Op.gt]: 0 } },
    });
  }

  /**
   * Búsqueda general por texto libre.
   *
   * Lógica:
   *  1. Detecta medida tipo "185/65R14" o "185/65r14".
   *     a) Sin marca extra  → busca TODAS las marcas con esa medida exacta.
   *     b) Con marca extra  → busca esa marca + esa medida.
   *  2. Si no es medida → busca por modelo, descripción y nombre de marca.
   *
   * Devuelve: { resultados, tipo, parsedMedida, marcaBuscada }
   */
  async buscarGeneral(q) {
    const query = (q || "").trim();
    if (!query) return { resultados: [], tipo: "vacio", parsedMedida: null, marcaBuscada: null };

    // ── Intentar parsear medida ──────────────────────────────────────────────
    // Acepta: 185/65R14, 185/65r14, 185-65-14, "185 65 14"
    const medidaRegex = /(\d{3})\s*[\/\-]\s*(\d{2})\s*[Rr]?\s*(\d{2})/;
    const medidaMatch = query.match(medidaRegex);

    if (medidaMatch) {
      const ancho = parseInt(medidaMatch[1]);
      const perfil = parseInt(medidaMatch[2]);
      const rin = parseInt(medidaMatch[3]);

      // Texto restante = posible nombre de marca
      const restoQuery = query.replace(medidaRegex, "").trim();
      const tieneMarca = restoQuery.length > 0;

      const whereExacto = { activo: true, ancho, perfil, rin };

      const includeConMarca = tieneMarca
        ? [
          {
            model: MarcaLlanta,
            as: "marca",
            attributes: ["idMarca", "nombre", "logoUrl"],
            where: { nombre: { [Op.iLike]: `%${restoQuery}%` } },
            required: true,
          },
          {
            model: ImagenLlanta,
            as: "imagenes",
            where: { tipoImagen: "PRINCIPAL" },
            required: false,
          },
        ]
        : defaultInclude;

      const resultados = await Llanta.findAll({
        where: whereExacto,
        include: includeConMarca,
        order: [["precio", "ASC"]],
      });

      return {
        resultados,
        tipo: "medida",
        parsedMedida: { ancho, perfil, rin },
        marcaBuscada: tieneMarca ? restoQuery : null,
      };
    }

    // ── Búsqueda por texto libre ─────────────────────────────────────────────
    const textWhere = {
      activo: true,
      [Op.or]: [
        { modelo: { [Op.iLike]: `%${query}%` } },
        { descripcion: { [Op.iLike]: `%${query}%` } },
        { procedencia: { [Op.iLike]: `%${query}%` } },
      ],
    };

    const [porTexto, porMarca] = await Promise.all([
      Llanta.findAll({
        where: textWhere,
        include: [
          {
            model: MarcaLlanta,
            as: "marca",
            attributes: ["idMarca", "nombre", "logoUrl"],
            required: false,
          },
          { model: ImagenLlanta, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false },
        ],
        order: [["destacado", "DESC"], ["precio", "ASC"]],
      }),
      Llanta.findAll({
        where: { activo: true },
        include: [
          {
            model: MarcaLlanta,
            as: "marca",
            attributes: ["idMarca", "nombre", "logoUrl"],
            where: { nombre: { [Op.iLike]: `%${query}%` } },
            required: true,
          },
          { model: ImagenLlanta, as: "imagenes", where: { tipoImagen: "PRINCIPAL" }, required: false },
        ],
        order: [["destacado", "DESC"], ["precio", "ASC"]],
      }),
    ]);

    // Deduplicar por idLlanta
    const seen = new Set();
    const combinados = [...porTexto, ...porMarca].filter((l) => {
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
    const baseWhere = { activo: true, stock: { [Op.gt]: 0 } };
    if (rin) baseWhere.rin = rin;
    if (excluir.length > 0) baseWhere.idLlanta = { [Op.notIn]: excluir };

    // Primero con oferta
    const conOferta = await Llanta.findAll({
      where: { ...baseWhere, precioOferta: { [Op.ne]: null } },
      include: defaultInclude,
      order: [["precio", "ASC"]],
      limit,
    });

    if (conOferta.length >= limit) return conOferta.slice(0, limit);

    // Rellenar sin duplicar
    const idsUsados = conOferta.map((l) => l.idLlanta);
    const whereRelleno = { ...baseWhere };
    if ([...excluir, ...idsUsados].length > 0)
      whereRelleno.idLlanta = { [Op.notIn]: [...excluir, ...idsUsados] };

    const relleno = await Llanta.findAll({
      where: whereRelleno,
      include: defaultInclude,
      order: [["destacado", "DESC"], ["precio", "ASC"]],
      limit: limit - conOferta.length,
    });

    return [...conOferta, ...relleno].slice(0, limit);
  }

  // Crear llanta
  async createLlanta(data) {
    return Llanta.create(data);
  }

  // Actualizar llanta
  async updateLlanta(id, data) {
    const llanta = await Llanta.findByPk(id);
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    await llanta.update(data);
    return llanta;
  }

  // Eliminar llanta (soft delete)
  async deleteLlanta(id) {
    const llanta = await Llanta.findByPk(id);
    if (!llanta) throw new NotFoundError("Llanta no encontrada");
    await llanta.update({ activo: false });
    return { message: "Llanta eliminada correctamente" };
  }
}

module.exports = new LlantaService();
