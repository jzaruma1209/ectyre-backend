"use strict";

const { Op } = require("sequelize");
const {
  sequelize,
  Producto,
  TipoProducto,
  Marca,
  Modelo,
  ProductoMedida,
  Ancho,
  Alto,
  Aro,
  ProductoEspecificacion,
  EspecificacionTecnica,
  ImagenProducto,
  Compatibilidad,
  ModeloVehiculo,
  MarcaVehiculo,
} = require("../models");
const { NotFoundError, ValidationError } = require("../utils/customErrors");
const { deleteImage, eliminarArchivosSubidos } = require("../config/cloudinary");
const { MAX_IMAGENES_PRODUCTO } = require("../utils/productoConstantes");
const { includeMedidas, includeProductoCompleto, serializarProducto } = require("../utils/productoHelpers");
const { aEntero, aDecimal, aBooleano, aLista } = require("../utils/normalizar");

// ─── Normalización de entrada (JSON o multipart) ─────────────────────────────

const normalizarEntrada = (datos = {}) => ({
  idTipoProducto: aEntero(datos.idTipoProducto),
  idMarca: aEntero(datos.idMarca),
  idModelo: aEntero(datos.idModelo),
  idAncho: aEntero(datos.idAncho),
  idAlto: aEntero(datos.idAlto),
  idAro: aEntero(datos.idAro),
  nombre: typeof datos.nombre === "string" ? datos.nombre.trim() : "",
  descripcion: typeof datos.descripcion === "string" ? datos.descripcion.trim() || null : null,
  precio: aDecimal(datos.precio),
  precioAnterior: aDecimal(datos.precioAnterior),
  stock: aEntero(datos.stock),
  especificaciones: aLista(datos.especificaciones),
  esNuevo: aBooleano(datos.esNuevo),
  enOferta: aBooleano(datos.enOferta),
  envioGratis: aBooleano(datos.envioGratis),
  aplicaDevoluciones: aBooleano(datos.aplicaDevoluciones),
  aplicaGarantia: aBooleano(datos.aplicaGarantia),
  destacado: aBooleano(datos.destacado),
  activo: aBooleano(datos.activo, true),
  idImagenPromocion: aEntero(datos.idImagenPromocion),
  // Imágenes: índice (en los archivos nuevos) o id (de una existente) de la principal
  principalNueva: aEntero(datos.principalNueva),
  principalExistente: aEntero(datos.principalExistente),
  // En edición: ids de imágenes que se conservan (undefined = conservar todas)
  imagenesConservar: aLista(datos.imagenesConservar)?.map(Number).filter(Number.isInteger),
});

// "225/75R15", "295/80R22.5", "205/55 R16"
const REGEX_MEDIDA = /(\d{2,3}(?:[.,]\d+)?)\s*[/\-xX]\s*(\d{2}(?:[.,]\d+)?)\s*[Rr]?\s*(\d{2}(?:[.,]\d)?)/;
const parsearMedida = (texto) => {
  const match = String(texto || "").match(REGEX_MEDIDA);
  if (!match) return null;
  const [ancho, alto, aro] = match.slice(1, 4).map((v) => Number(v.replace(",", ".")));
  return { ancho, alto, aro, resto: String(texto).replace(REGEX_MEDIDA, "").trim() };
};

const ordenPublico = [
  [sequelize.literal('("Producto"."stock" > 0)'), "DESC"],
  ["destacado", "DESC"],
  ["idProducto", "DESC"],
];

class ProductoService {
  // ═══════════════════════════════════════════════════════════════════════════
  // Validación de reglas de negocio (sección 6 de la arquitectura)
  // ═══════════════════════════════════════════════════════════════════════════
  async _validar(entrada, { imagenesTotales }) {
    const errores = [];

    // Tipo de producto
    let tipo = null;
    if (entrada.idTipoProducto === null) {
      errores.push("Selecciona el tipo de producto");
    } else if (Number.isNaN(entrada.idTipoProducto)) {
      errores.push("Tipo de producto inválido");
    } else {
      tipo = await TipoProducto.findByPk(entrada.idTipoProducto);
      if (!tipo) errores.push("El tipo de producto no existe. Créalo primero en Niveles de Inventario");
    }

    // Regla 8: la marca debe existir previamente (y pertenecer al tipo elegido)
    let marca = null;
    if (entrada.idMarca === null) {
      errores.push("Selecciona la marca");
    } else if (Number.isNaN(entrada.idMarca)) {
      errores.push("Marca inválida");
    } else {
      marca = await Marca.findByPk(entrada.idMarca);
      if (!marca) {
        errores.push("La marca no existe. Debe crearse primero en Niveles de Inventario");
      } else if (tipo && marca.idTipoProducto !== tipo.idTipoProducto) {
        errores.push(`La marca "${marca.nombre}" no pertenece al tipo de producto "${tipo.nombre}"`);
      }
    }

    // Regla 1: modelo y medidas obligatorios si el tipo lo requiere
    const requiereModeloMedidas = Boolean(tipo?.requiereModeloMedidas);
    if (requiereModeloMedidas) {
      if (entrada.idModelo === null || Number.isNaN(entrada.idModelo)) {
        errores.push(`El modelo es obligatorio para ${tipo.nombre}`);
      } else {
        const modelo = await Modelo.findByPk(entrada.idModelo);
        if (!modelo) {
          errores.push("El modelo seleccionado no existe");
        } else if (marca && modelo.idMarca !== marca.idMarca) {
          // Regla 2: el modelo debe pertenecer a la marca seleccionada
          errores.push(`El modelo "${modelo.nombre}" no pertenece a la marca "${marca.nombre}"`);
        }
      }
      for (const [campo, ModeloMedida, etiqueta] of [
        ["idAncho", Ancho, "ancho"],
        ["idAlto", Alto, "alto"],
        ["idAro", Aro, "aro"],
      ]) {
        if (entrada[campo] === null || Number.isNaN(entrada[campo])) {
          errores.push(`El ${etiqueta} es obligatorio para ${tipo.nombre}`);
        } else if (!(await ModeloMedida.findByPk(entrada[campo]))) {
          errores.push(`El ${etiqueta} seleccionado no existe`);
        }
      }
    }

    // Datos comunes
    if (!entrada.nombre || entrada.nombre.length < 2) {
      errores.push("El nombre del producto es obligatorio (mínimo 2 caracteres)");
    } else if (entrada.nombre.length > 150) {
      errores.push("El nombre del producto no puede superar 150 caracteres");
    }

    // Regla 9: precio mayor a 0
    const precioValido = entrada.precio !== null && !Number.isNaN(entrada.precio);
    if (!precioValido) {
      errores.push("El precio es obligatorio y debe ser numérico");
    } else if (entrada.precio <= 0) {
      errores.push("El precio debe ser mayor a 0");
    }

    // Regla 5: precio anterior mayor al precio actual
    if (Number.isNaN(entrada.precioAnterior)) {
      errores.push("El precio anterior debe ser numérico");
    } else if (entrada.precioAnterior !== null && precioValido && entrada.precioAnterior <= entrada.precio) {
      errores.push("El precio anterior debe ser mayor al precio actual");
    }

    // Regla 6: "En oferta" exige precio anterior
    if (entrada.enOferta && (entrada.precioAnterior === null || Number.isNaN(entrada.precioAnterior))) {
      errores.push('Para marcar el producto "En oferta" debes ingresar el precio anterior');
    }

    // Regla 10: stock 0 es válido (el card mostrará "Agotado")
    if (entrada.stock === null || Number.isNaN(entrada.stock) || entrada.stock < 0) {
      errores.push("El stock debe ser un número entero mayor o igual a 0");
    }

    // Regla 7: solo especificaciones asociadas al tipo de producto
    const especificaciones = [];
    const vistas = new Set();
    const lista = entrada.especificaciones || [];
    const ids = lista.map((e) => aEntero(e?.idEspecificacion));
    const catalogo = ids.some((id) => Number.isInteger(id))
      ? await EspecificacionTecnica.findAll({
          where: { idEspecificacion: ids.filter(Number.isInteger) },
          include: [{ model: TipoProducto, as: "tiposProducto", attributes: ["idTipoProducto"], through: { attributes: [] } }],
        })
      : [];
    lista.forEach((item, indice) => {
      const id = ids[indice];
      const valor = typeof item?.valor === "string" || typeof item?.valor === "number" ? String(item.valor).trim() : "";
      const especificacion = catalogo.find((e) => e.idEspecificacion === id);
      if (!Number.isInteger(id) || !especificacion) {
        errores.push("Una de las especificaciones técnicas seleccionadas no existe");
        return;
      }
      if (vistas.has(id)) {
        errores.push(`La especificación "${especificacion.nombre}" está repetida`);
        return;
      }
      vistas.add(id);
      if (tipo && !especificacion.tiposProducto.some((t) => t.idTipoProducto === tipo.idTipoProducto)) {
        errores.push(`La especificación "${especificacion.nombre}" no aplica a ${tipo.nombre}`);
        return;
      }
      if (!valor) {
        errores.push(`Ingresa el valor de la especificación "${especificacion.nombre}"`);
        return;
      }
      if (valor.length > 100) {
        errores.push(`El valor de "${especificacion.nombre}" no puede superar 100 caracteres`);
        return;
      }
      especificaciones.push({ idEspecificacion: id, valor });
    });

    // Regla 3: máximo 5 fotos
    if (imagenesTotales > MAX_IMAGENES_PRODUCTO) {
      errores.push(`Máximo ${MAX_IMAGENES_PRODUCTO} imágenes por producto (se recibieron ${imagenesTotales})`);
    }

    if (errores.length > 0) {
      throw new ValidationError(
        errores.length === 1 ? errores[0] : `El producto tiene ${errores.length} errores. Revisa los datos.`,
        errores
      );
    }

    return { requiereModeloMedidas, especificaciones };
  }

  _camposProducto(entrada, requiereModeloMedidas) {
    return {
      idTipoProducto: entrada.idTipoProducto,
      idMarca: entrada.idMarca,
      idModelo: requiereModeloMedidas ? entrada.idModelo : null,
      nombre: entrada.nombre,
      descripcion: entrada.descripcion,
      precio: entrada.precio,
      precioAnterior: entrada.precioAnterior,
      stock: entrada.stock,
      esNuevo: entrada.esNuevo,
      enOferta: entrada.enOferta,
      envioGratis: entrada.envioGratis,
      aplicaDevoluciones: entrada.aplicaDevoluciones,
      aplicaGarantia: entrada.aplicaGarantia,
      destacado: entrada.destacado,
      activo: entrada.activo,
      idImagenPromocion: Number.isInteger(entrada.idImagenPromocion) ? entrada.idImagenPromocion : null,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin — crear / editar / estado
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Crea un producto con todas sus relaciones en una sola transacción.
   * @param {object} datos  campos del producto (ver normalizarEntrada)
   * @param {Array}  archivos  fotos ya subidas por multer (máx 5)
   */
  async crear(datos, archivos = []) {
    try {
      const entrada = normalizarEntrada(datos);
      const { requiereModeloMedidas, especificaciones } = await this._validar(entrada, {
        imagenesTotales: archivos.length,
      });

      const idProducto = await sequelize.transaction(async (transaction) => {
        const producto = await Producto.create(this._camposProducto(entrada, requiereModeloMedidas), { transaction });

        if (requiereModeloMedidas) {
          await ProductoMedida.create(
            { idProducto: producto.idProducto, idAncho: entrada.idAncho, idAlto: entrada.idAlto, idAro: entrada.idAro },
            { transaction }
          );
        }

        if (especificaciones.length > 0) {
          await ProductoEspecificacion.bulkCreate(
            especificaciones.map((e) => ({ ...e, idProducto: producto.idProducto })),
            { transaction }
          );
        }

        if (archivos.length > 0) {
          // Regla 4: si no se marcó principal, la primera foto subida es la principal
          const indicePrincipal =
            Number.isInteger(entrada.principalNueva) && entrada.principalNueva >= 0 && entrada.principalNueva < archivos.length
              ? entrada.principalNueva
              : 0;
          await ImagenProducto.bulkCreate(
            archivos.map((archivo, indice) => ({
              idProducto: producto.idProducto,
              urlImagen: archivo.path,
              publicId: archivo.filename || null,
              orden: indice,
              tipoImagen: indice === indicePrincipal ? "PRINCIPAL" : "DETALLE",
            })),
            { transaction }
          );
        }

        return producto.idProducto;
      });

      return this.obtenerAdmin(idProducto);
    } catch (error) {
      await eliminarArchivosSubidos(archivos);
      throw error;
    }
  }

  async actualizar(idProducto, datos, archivos = []) {
    try {
      const producto = await Producto.findByPk(idProducto, {
        include: [
          { model: ImagenProducto, as: "imagenes" },
          { model: ProductoEspecificacion, as: "especificaciones" },
        ],
      });
      if (!producto) throw new NotFoundError("Producto no encontrado");

      const entrada = normalizarEntrada(datos);
      if (entrada.especificaciones === undefined) {
        entrada.especificaciones = producto.especificaciones.map((pe) => ({
          idEspecificacion: pe.idEspecificacion,
          valor: pe.valor,
        }));
      }

      const actuales = [...producto.imagenes].sort((a, b) => a.orden - b.orden || a.idImagen - b.idImagen);
      const idsActuales = actuales.map((img) => img.idImagen);
      const conservar =
        entrada.imagenesConservar === undefined
          ? idsActuales
          : [...new Set(entrada.imagenesConservar)].filter((id) => idsActuales.includes(id));
      const eliminar = actuales.filter((img) => !conservar.includes(img.idImagen));

      const { requiereModeloMedidas, especificaciones } = await this._validar(entrada, {
        imagenesTotales: conservar.length + archivos.length,
      });

      await sequelize.transaction(async (transaction) => {
        await producto.update(this._camposProducto(entrada, requiereModeloMedidas), { transaction });

        // Medidas: solo existen si el tipo lo requiere
        if (requiereModeloMedidas) {
          const medidas = { idAncho: entrada.idAncho, idAlto: entrada.idAlto, idAro: entrada.idAro };
          const existente = await ProductoMedida.findOne({ where: { idProducto }, transaction });
          if (existente) await existente.update(medidas, { transaction });
          else await ProductoMedida.create({ idProducto, ...medidas }, { transaction });
        } else {
          await ProductoMedida.destroy({ where: { idProducto }, transaction });
        }

        // Especificaciones: se reemplazan completas
        await ProductoEspecificacion.destroy({ where: { idProducto }, transaction });
        if (especificaciones.length > 0) {
          await ProductoEspecificacion.bulkCreate(
            especificaciones.map((e) => ({ ...e, idProducto })),
            { transaction }
          );
        }

        // Imágenes: quitar, reordenar (conservadas primero) y agregar nuevas
        if (eliminar.length > 0) {
          await ImagenProducto.destroy({ where: { idImagen: eliminar.map((img) => img.idImagen) }, transaction });
        }
        for (const [indice, idImagen] of conservar.entries()) {
          await ImagenProducto.update({ orden: indice }, { where: { idImagen }, transaction });
        }
        const nuevas = archivos.length
          ? await ImagenProducto.bulkCreate(
              archivos.map((archivo, indice) => ({
                idProducto,
                urlImagen: archivo.path,
                publicId: archivo.filename || null,
                orden: conservar.length + indice,
                tipoImagen: "DETALLE",
              })),
              { transaction }
            )
          : [];

        // Regla 4: siempre queda exactamente una principal si hay fotos
        let idPrincipal = null;
        if (Number.isInteger(entrada.principalExistente) && conservar.includes(entrada.principalExistente)) {
          idPrincipal = entrada.principalExistente;
        } else if (Number.isInteger(entrada.principalNueva) && nuevas[entrada.principalNueva]) {
          idPrincipal = nuevas[entrada.principalNueva].idImagen;
        } else {
          const principalActual = actuales.find(
            (img) => img.tipoImagen === "PRINCIPAL" && conservar.includes(img.idImagen)
          );
          idPrincipal = principalActual?.idImagen ?? conservar[0] ?? nuevas[0]?.idImagen ?? null;
        }
        await ImagenProducto.update(
          { tipoImagen: "DETALLE" },
          { where: { idProducto, tipoImagen: "PRINCIPAL" }, transaction }
        );
        if (idPrincipal) {
          await ImagenProducto.update({ tipoImagen: "PRINCIPAL" }, { where: { idImagen: idPrincipal }, transaction });
        }
      });

      // Ya confirmado en BD: borrar de Cloudinary las fotos quitadas
      await Promise.all(
        eliminar
          .filter((img) => img.publicId)
          .map((img) =>
            deleteImage(img.publicId).catch((error) =>
              console.warn(`[Cloudinary] No se pudo eliminar ${img.publicId}: ${error.message}`)
            )
          )
      );

      return this.obtenerAdmin(idProducto);
    } catch (error) {
      await eliminarArchivosSubidos(archivos);
      throw error;
    }
  }

  async cambiarEstado(idProducto, activo) {
    const producto = await Producto.findByPk(idProducto);
    if (!producto) throw new NotFoundError("Producto no encontrado");
    await producto.update({ activo: aBooleano(activo, !producto.activo) });
    return this.obtenerAdmin(idProducto);
  }

  // Borrado lógico (convención del proyecto): el producto deja de mostrarse en la tienda
  async desactivar(idProducto) {
    const producto = await Producto.findByPk(idProducto);
    if (!producto) throw new NotFoundError("Producto no encontrado");
    await producto.update({ activo: false });
    return { idProducto: producto.idProducto, message: "Producto desactivado correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Admin — lectura
  // ═══════════════════════════════════════════════════════════════════════════

  async obtenerAdmin(idProducto) {
    const producto = await Producto.findByPk(idProducto, { include: includeProductoCompleto() });
    if (!producto) throw new NotFoundError("Producto no encontrado");
    return serializarProducto(producto);
  }

  async listarAdmin({ page = 1, limit = 15, search = "", idTipoProducto = null, estado = "todos" } = {}) {
    const pagina = Math.max(1, parseInt(page, 10) || 1);
    const porPagina = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const where = {};
    const include = [
      { model: Marca, as: "marca", attributes: [] },
      { model: Modelo, as: "modelo", attributes: [], required: false },
    ];

    if (idTipoProducto) where.idTipoProducto = aEntero(idTipoProducto);
    if (estado === "activos") where.activo = true;
    if (estado === "inactivos") where.activo = false;

    const texto = String(search || "").trim();
    if (texto) {
      const medida = parsearMedida(texto);
      if (medida) {
        include.push({ ...includeMedidas(medida), attributes: [] });
      } else {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${texto}%` } },
          { descripcion: { [Op.iLike]: `%${texto}%` } },
          { "$marca.nombre$": { [Op.iLike]: `%${texto}%` } },
          { "$modelo.nombre$": { [Op.iLike]: `%${texto}%` } },
        ];
      }
    }

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include,
      attributes: ["idProducto"],
      order: [["idProducto", "DESC"]],
      limit: porPagina,
      offset: (pagina - 1) * porPagina,
      subQuery: false,
      distinct: true,
    });

    return {
      productos: await this._cargarCompletos(rows.map((r) => r.idProducto)),
      total: count,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(count / porPagina)),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Catálogo público (card del cliente)
  // ═══════════════════════════════════════════════════════════════════════════

  // Carga productos completos respetando el orden de ids recibido
  async _cargarCompletos(ids) {
    const unicos = [...new Set(ids)];
    if (unicos.length === 0) return [];
    const productos = await Producto.findAll({
      where: { idProducto: unicos },
      include: includeProductoCompleto(),
    });
    const porId = new Map(productos.map((p) => [p.idProducto, p]));
    return unicos.map((id) => porId.get(id)).filter(Boolean).map(serializarProducto);
  }

  async _idsPublicos({ where = {}, include = [], order = ordenPublico, limit = null, offset = 0 }) {
    const filas = await Producto.findAll({
      where: { activo: true, ...where },
      include,
      attributes: ["idProducto"],
      order,
      ...(limit ? { limit, offset } : {}),
      subQuery: false,
    });
    return [...new Set(filas.map((f) => f.idProducto))];
  }

  async listarPublico({ idTipoProducto, idMarca, destacado, soloConMedidas, limit, offset } = {}) {
    const where = {};
    const include = [];
    if (idTipoProducto) where.idTipoProducto = aEntero(idTipoProducto);
    if (idMarca) where.idMarca = aEntero(idMarca);
    if (aBooleano(destacado)) where.destacado = true;
    if (soloConMedidas) {
      include.push({
        model: TipoProducto,
        as: "tipoProducto",
        attributes: [],
        where: { requiereModeloMedidas: true },
        required: true,
      });
    }
    const ids = await this._idsPublicos({
      where,
      include,
      limit: limit ? Math.min(200, parseInt(limit, 10) || 60) : null,
      offset: parseInt(offset, 10) || 0,
    });
    return this._cargarCompletos(ids);
  }

  async obtenerPublico(idProducto) {
    const producto = await Producto.findOne({
      where: { idProducto, activo: true },
      include: includeProductoCompleto(),
    });
    if (!producto) throw new NotFoundError("Producto no encontrado");
    return serializarProducto(producto);
  }

  async buscarPorMedida({ ancho = null, alto = null, aro = null } = {}) {
    const ids = await this._idsPublicos({ include: [{ ...includeMedidas({ ancho, alto, aro }), attributes: [] }] });
    return this._cargarCompletos(ids);
  }

  async buscarPorVehiculo({ marca, modelo, anio }) {
    const ids = await this._idsPublicos({
      include: [
        {
          model: Compatibilidad,
          as: "compatibilidades",
          attributes: [],
          required: true,
          where: {
            anioDesde: { [Op.lte]: anio },
            [Op.or]: [{ anioHasta: { [Op.gte]: anio } }, { anioHasta: null }],
          },
          include: [
            {
              model: ModeloVehiculo,
              as: "modelo",
              attributes: [],
              required: true,
              where: { nombre: { [Op.iLike]: `%${modelo}%` } },
              include: [
                {
                  model: MarcaVehiculo,
                  as: "marca",
                  attributes: [],
                  required: true,
                  where: { nombre: { [Op.iLike]: `%${marca}%` } },
                },
              ],
            },
          ],
        },
      ],
    });
    return this._cargarCompletos(ids);
  }

  /**
   * Búsqueda general por texto libre.
   * Detecta medida tipo "225/75R15" (+ marca opcional) o busca por nombre, marca, modelo o tipo.
   */
  async buscarGeneral(q) {
    const query = String(q || "").trim();
    if (!query) return { resultados: [], tipo: "vacio", parsedMedida: null, marcaBuscada: null };

    const medida = parsearMedida(query);
    if (medida) {
      const include = [{ ...includeMedidas(medida), attributes: [] }];
      if (medida.resto) {
        include.push({
          model: Marca,
          as: "marca",
          attributes: [],
          required: true,
          where: { nombre: { [Op.iLike]: `%${medida.resto}%` } },
        });
      }
      const ids = await this._idsPublicos({ include });
      return {
        resultados: await this._cargarCompletos(ids),
        tipo: "medida",
        parsedMedida: { ancho: medida.ancho, perfil: medida.alto, rin: medida.aro },
        marcaBuscada: medida.resto || null,
      };
    }

    const patron = { [Op.iLike]: `%${query}%` };
    const ids = await this._idsPublicos({
      where: {
        [Op.or]: [
          { nombre: patron },
          { descripcion: patron },
          { "$marca.nombre$": patron },
          { "$modelo.nombre$": patron },
          { "$tipoProducto.nombre$": patron },
        ],
      },
      include: [
        { model: Marca, as: "marca", attributes: [] },
        { model: Modelo, as: "modelo", attributes: [], required: false },
        { model: TipoProducto, as: "tipoProducto", attributes: [] },
      ],
    });
    return { resultados: await this._cargarCompletos(ids), tipo: "texto", parsedMedida: null, marcaBuscada: null };
  }

  /**
   * Recomendaciones: mismo aro (si se indica), con stock, ofertas primero.
   */
  async obtenerRecomendaciones({ aro = null, excluirIds = [], limit = 8 } = {}) {
    const excluir = (Array.isArray(excluirIds) ? excluirIds : []).map(Number).filter(Number.isInteger);
    const where = { stock: { [Op.gt]: 0 } };
    if (excluir.length > 0) where.idProducto = { [Op.notIn]: excluir };
    const include = aro ? [{ ...includeMedidas({ aro }), attributes: [] }] : [];
    const ids = await this._idsPublicos({
      where,
      include,
      order: [
        ["enOferta", "DESC"],
        ["destacado", "DESC"],
        ["idProducto", "DESC"],
      ],
      limit,
    });
    return this._cargarCompletos(ids);
  }
}

module.exports = new ProductoService();
module.exports.parsearMedida = parsearMedida;
