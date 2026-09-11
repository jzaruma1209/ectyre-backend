"use strict";

const { Op } = require("sequelize");
const {
  sequelize,
  TipoProducto,
  Marca,
  Modelo,
  TipoUso,
  Ancho,
  Alto,
  Aro,
  EspecificacionTecnica,
  Producto,
  ProductoEspecificacion,
} = require("../models");
const { NotFoundError, ValidationError, ConflictError } = require("../utils/customErrors");
const { eliminarArchivosSubidos } = require("../config/cloudinary");
const { aEntero, aDecimal, aBooleano, aLista, aTexto, escaparLike, esUrlValida } = require("../utils/normalizar");

// Catálogos planos de medidas (independientes de marca y modelo)
const MEDIDAS = {
  anchos: { Modelo: Ancho, pk: "idAncho", campo: "id_ancho", nombreModelo: "Ancho", etiqueta: "ancho" },
  altos: { Modelo: Alto, pk: "idAlto", campo: "id_alto", nombreModelo: "Alto", etiqueta: "alto" },
  aros: { Modelo: Aro, pk: "idAro", campo: "id_aro", nombreModelo: "Aro", etiqueta: "aro" },
};

const contar = (sql, alias) => [sequelize.literal(`CAST((${sql}) AS INTEGER)`), alias];
const mismoNombre = (nombre) => ({ [Op.iLike]: escaparLike(nombre) });

const lanzarSiHayErrores = (errores) => {
  if (errores.length > 0) {
    throw new ValidationError(errores.length === 1 ? errores[0] : "Revisa los datos ingresados", errores);
  }
};

// Resuelve la URL final de una imagen: archivo subido > URL escrita > valor actual
const resolverImagen = ({ archivo, url, quitar, actual = null }, etiqueta, errores) => {
  if (archivo?.path) return archivo.path;
  if (aBooleano(quitar)) return null;
  if (url === undefined) return actual;
  const texto = aTexto(url);
  if (!texto) return null;
  if (!esUrlValida(texto)) {
    errores.push(`La URL del ${etiqueta} no es válida (debe empezar con http:// o https://)`);
    return actual;
  }
  return texto;
};

class NivelesService {
  // ═══════════════════════════════════════════════════════════════════════════
  // Consolidado (formulario de producto y pestaña Niveles de Inventario)
  // ═══════════════════════════════════════════════════════════════════════════
  async obtenerNiveles({ todos = false } = {}) {
    const [tiposProducto, marcas, modelos, tiposUso, anchos, altos, aros, especificaciones] = await Promise.all([
      this.listarTiposProducto({ todos }),
      this.listarMarcas({ todos }),
      this.listarModelos({ todos }),
      this.listarTiposUso(),
      this.listarMedidas("anchos", { todos }),
      this.listarMedidas("altos", { todos }),
      this.listarMedidas("aros", { todos }),
      this.listarEspecificaciones({ todos }),
    ]);
    return { tiposProducto, marcas, modelos, tiposUso, anchos, altos, aros, especificaciones };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Tipos de producto
  // ═══════════════════════════════════════════════════════════════════════════
  async listarTiposProducto({ todos = false } = {}) {
    return TipoProducto.findAll({
      where: todos ? {} : { activo: true },
      attributes: {
        include: [
          contar(`SELECT COUNT(*) FROM marcas m WHERE m.id_tipo_producto = "TipoProducto"."id_tipo_producto"`, "totalMarcas"),
          contar(
            `SELECT COUNT(*) FROM productos p WHERE p.id_tipo_producto = "TipoProducto"."id_tipo_producto"`,
            "totalProductos"
          ),
        ],
      },
      order: [["nombre", "ASC"]],
    });
  }

  async _siguienteCodigoTipo() {
    const codigos = (await TipoProducto.findAll({ attributes: ["codigo"] })).map((t) => t.codigo);
    let siguiente = codigos.reduce((max, c) => Math.max(max, parseInt(c, 10) || 0), 0) + 1;
    while (codigos.includes(String(siguiente).padStart(3, "0"))) siguiente += 1;
    return String(siguiente).padStart(3, "0");
  }

  async crearTipoProducto(data = {}) {
    const errores = [];
    const nombre = aTexto(data.nombre);
    if (!nombre) errores.push("El nombre del tipo de producto es obligatorio");
    if (nombre.length > 100) errores.push("El nombre no puede superar 100 caracteres");
    const codigo = aTexto(data.codigo).toUpperCase();
    if (codigo.length > 10) errores.push("El código no puede superar 10 caracteres");
    lanzarSiHayErrores(errores);

    if (await TipoProducto.findOne({ where: { nombre: mismoNombre(nombre) } })) {
      throw new ConflictError(`Ya existe el tipo de producto "${nombre}"`);
    }
    if (codigo && (await TipoProducto.findOne({ where: { codigo } }))) {
      throw new ConflictError(`Ya existe un tipo de producto con el código "${codigo}"`);
    }

    const tipo = await TipoProducto.create({
      codigo: codigo || (await this._siguienteCodigoTipo()),
      nombre,
      descripcion: aTexto(data.descripcion) || null,
      requiereModeloMedidas: aBooleano(data.requiereModeloMedidas),
      activo: aBooleano(data.activo, true),
    });
    return tipo;
  }

  async actualizarTipoProducto(id, data = {}) {
    const tipo = await TipoProducto.findByPk(id);
    if (!tipo) throw new NotFoundError("Tipo de producto no encontrado");

    const cambios = {};
    if (data.nombre !== undefined) {
      const nombre = aTexto(data.nombre);
      if (!nombre) throw new ValidationError("El nombre del tipo de producto es obligatorio");
      const duplicado = await TipoProducto.findOne({
        where: { nombre: mismoNombre(nombre), idTipoProducto: { [Op.ne]: tipo.idTipoProducto } },
      });
      if (duplicado) throw new ConflictError(`Ya existe el tipo de producto "${nombre}"`);
      cambios.nombre = nombre;
    }
    if (data.descripcion !== undefined) cambios.descripcion = aTexto(data.descripcion) || null;
    if (data.activo !== undefined) cambios.activo = aBooleano(data.activo, true);

    if (data.requiereModeloMedidas !== undefined) {
      const requiere = aBooleano(data.requiereModeloMedidas);
      if (requiere !== tipo.requiereModeloMedidas) {
        const productos = await Producto.count({ where: { idTipoProducto: tipo.idTipoProducto } });
        if (productos > 0) {
          throw new ConflictError(
            `No se puede cambiar el flujo de "${tipo.nombre}" porque ya tiene ${productos} producto(s). ` +
              "Cambiarlo dejaría esos productos incompletos."
          );
        }
        if (!requiere) {
          const modelos = await Modelo.count({
            include: [{ model: Marca, as: "marca", where: { idTipoProducto: tipo.idTipoProducto }, required: true }],
          });
          if (modelos > 0) {
            throw new ConflictError(
              `"${tipo.nombre}" tiene ${modelos} modelo(s) registrados. Elimínalos antes de quitar Modelo y Medidas.`
            );
          }
        }
        cambios.requiereModeloMedidas = requiere;
      }
    }

    await tipo.update(cambios);
    return tipo;
  }

  async eliminarTipoProducto(id) {
    const tipo = await TipoProducto.findByPk(id);
    if (!tipo) throw new NotFoundError("Tipo de producto no encontrado");
    const [marcas, productos] = await Promise.all([
      Marca.count({ where: { idTipoProducto: tipo.idTipoProducto } }),
      Producto.count({ where: { idTipoProducto: tipo.idTipoProducto } }),
    ]);
    if (marcas > 0 || productos > 0) {
      throw new ConflictError(
        `No se puede eliminar "${tipo.nombre}" porque tiene ${marcas} marca(s) y ${productos} producto(s). Puedes desactivarlo.`
      );
    }
    await tipo.destroy();
    return { idTipoProducto: tipo.idTipoProducto, message: "Tipo de producto eliminado correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Marcas (pertenecen a un tipo de producto; logo y banner obligatorios en Llantas)
  // ═══════════════════════════════════════════════════════════════════════════
  async listarMarcas({ idTipoProducto = null, todos = false } = {}) {
    const where = todos ? {} : { activo: true };
    if (idTipoProducto) where.idTipoProducto = aEntero(idTipoProducto);
    return Marca.findAll({
      where,
      include: [
        { model: TipoProducto, as: "tipoProducto", attributes: ["idTipoProducto", "nombre", "requiereModeloMedidas"] },
      ],
      attributes: {
        include: [
          contar(`SELECT COUNT(*) FROM modelos mo WHERE mo.id_marca = "Marca"."id_marca"`, "totalModelos"),
          contar(`SELECT COUNT(*) FROM productos p WHERE p.id_marca = "Marca"."id_marca"`, "totalProductos"),
        ],
      },
      order: [["nombre", "ASC"]],
    });
  }

  async obtenerMarca(id) {
    const marca = await Marca.findByPk(id, {
      include: [
        { model: TipoProducto, as: "tipoProducto", attributes: ["idTipoProducto", "nombre", "requiereModeloMedidas"] },
      ],
    });
    if (!marca) throw new NotFoundError("Marca no encontrada");
    return marca;
  }

  async crearMarca(data = {}, archivos = {}) {
    try {
      const errores = [];
      const nombre = aTexto(data.nombre);
      const idTipoProducto = aEntero(data.idTipoProducto);
      if (!nombre) errores.push("El nombre de la marca es obligatorio");
      if (nombre.length > 100) errores.push("El nombre no puede superar 100 caracteres");
      if (!Number.isInteger(idTipoProducto)) errores.push("Selecciona el tipo de producto de la marca");
      lanzarSiHayErrores(errores);

      const tipo = await TipoProducto.findByPk(idTipoProducto);
      if (!tipo) throw new ValidationError("El tipo de producto seleccionado no existe");

      const logoUrl = resolverImagen({ archivo: archivos.logo?.[0], url: data.logoUrl }, "logo", errores);
      const bannerUrl = resolverImagen({ archivo: archivos.banner?.[0], url: data.bannerUrl }, "banner", errores);
      if (tipo.requiereModeloMedidas) {
        if (!logoUrl) errores.push(`El logo es obligatorio para marcas de ${tipo.nombre}`);
        if (!bannerUrl) errores.push(`El banner es obligatorio para marcas de ${tipo.nombre}`);
      }
      lanzarSiHayErrores(errores);

      if (await Marca.findOne({ where: { idTipoProducto, nombre: mismoNombre(nombre) } })) {
        throw new ConflictError(`La marca "${nombre}" ya existe en ${tipo.nombre}`);
      }

      const marca = await Marca.create({
        idTipoProducto,
        nombre,
        descripcion: aTexto(data.descripcion) || null,
        paisOrigen: aTexto(data.paisOrigen) || null,
        logoUrl,
        bannerUrl,
        activo: aBooleano(data.activo, true),
      });
      return this.obtenerMarca(marca.idMarca);
    } catch (error) {
      await eliminarArchivosSubidos(archivos);
      throw error;
    }
  }

  async actualizarMarca(id, data = {}, archivos = {}) {
    try {
      const marca = await Marca.findByPk(id);
      if (!marca) throw new NotFoundError("Marca no encontrada");

      const errores = [];
      const cambios = {};
      let idTipoProducto = marca.idTipoProducto;

      if (data.idTipoProducto !== undefined) {
        idTipoProducto = aEntero(data.idTipoProducto);
        if (!Number.isInteger(idTipoProducto)) errores.push("Selecciona el tipo de producto de la marca");
        else if (idTipoProducto !== marca.idTipoProducto) {
          const [productos, modelos] = await Promise.all([
            Producto.count({ where: { idMarca: marca.idMarca } }),
            Modelo.count({ where: { idMarca: marca.idMarca } }),
          ]);
          if (productos > 0 || modelos > 0) {
            throw new ConflictError(
              `No se puede cambiar el tipo de "${marca.nombre}" porque tiene ${productos} producto(s) y ${modelos} modelo(s).`
            );
          }
          cambios.idTipoProducto = idTipoProducto;
        }
      }
      lanzarSiHayErrores(errores);
      const tipo = await TipoProducto.findByPk(idTipoProducto);
      if (!tipo) throw new ValidationError("El tipo de producto seleccionado no existe");

      if (data.nombre !== undefined) {
        const nombre = aTexto(data.nombre);
        if (!nombre) errores.push("El nombre de la marca es obligatorio");
        else if (nombre.length > 100) errores.push("El nombre no puede superar 100 caracteres");
        else cambios.nombre = nombre;
      }
      const nombreFinal = cambios.nombre || marca.nombre;
      const duplicado = await Marca.findOne({
        where: { idTipoProducto, nombre: mismoNombre(nombreFinal), idMarca: { [Op.ne]: marca.idMarca } },
      });
      if (duplicado) throw new ConflictError(`La marca "${nombreFinal}" ya existe en ${tipo.nombre}`);

      if (data.descripcion !== undefined) cambios.descripcion = aTexto(data.descripcion) || null;
      if (data.paisOrigen !== undefined) cambios.paisOrigen = aTexto(data.paisOrigen) || null;
      if (data.activo !== undefined) cambios.activo = aBooleano(data.activo, true);

      cambios.logoUrl = resolverImagen(
        { archivo: archivos.logo?.[0], url: data.logoUrl, quitar: data.quitarLogo, actual: marca.logoUrl },
        "logo",
        errores
      );
      cambios.bannerUrl = resolverImagen(
        { archivo: archivos.banner?.[0], url: data.bannerUrl, quitar: data.quitarBanner, actual: marca.bannerUrl },
        "banner",
        errores
      );
      if (tipo.requiereModeloMedidas) {
        if (!cambios.logoUrl) errores.push(`El logo es obligatorio para marcas de ${tipo.nombre}`);
        if (!cambios.bannerUrl) errores.push(`El banner es obligatorio para marcas de ${tipo.nombre}`);
      }
      lanzarSiHayErrores(errores);

      await marca.update(cambios);
      return this.obtenerMarca(marca.idMarca);
    } catch (error) {
      await eliminarArchivosSubidos(archivos);
      throw error;
    }
  }

  async eliminarMarca(id) {
    const marca = await Marca.findByPk(id);
    if (!marca) throw new NotFoundError("Marca no encontrada");
    const [productos, modelos] = await Promise.all([
      Producto.count({ where: { idMarca: marca.idMarca } }),
      Modelo.count({ where: { idMarca: marca.idMarca } }),
    ]);
    if (productos > 0 || modelos > 0) {
      throw new ConflictError(
        `No se puede eliminar "${marca.nombre}" porque tiene ${productos} producto(s) y ${modelos} modelo(s). Puedes desactivarla.`
      );
    }
    await marca.destroy();
    return { idMarca: marca.idMarca, message: "Marca eliminada correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Modelos (siempre ligados a una marca cuyo tipo requiere modelo y medidas)
  // ═══════════════════════════════════════════════════════════════════════════
  async listarModelos({ idMarca = null, idTipoProducto = null, todos = false } = {}) {
    const where = todos ? {} : { activo: true };
    if (idMarca) where.idMarca = aEntero(idMarca);
    return Modelo.findAll({
      where,
      include: [
        {
          model: Marca,
          as: "marca",
          attributes: ["idMarca", "nombre", "idTipoProducto"],
          ...(idTipoProducto ? { where: { idTipoProducto: aEntero(idTipoProducto) }, required: true } : {}),
        },
        { model: TipoUso, as: "tipoUso", required: false, attributes: ["idTipoUso", "codigo", "descripcion"] },
      ],
      attributes: {
        include: [contar(`SELECT COUNT(*) FROM productos p WHERE p.id_modelo = "Modelo"."id_modelo"`, "totalProductos")],
      },
      order: [["nombre", "ASC"]],
    });
  }

  async _obtenerModelo(id) {
    const modelo = await Modelo.findByPk(id, {
      include: [
        { model: Marca, as: "marca", attributes: ["idMarca", "nombre", "idTipoProducto"] },
        { model: TipoUso, as: "tipoUso", required: false, attributes: ["idTipoUso", "codigo", "descripcion"] },
      ],
    });
    if (!modelo) throw new NotFoundError("Modelo no encontrado");
    return modelo;
  }

  async _validarMarcaDeModelo(idMarca) {
    if (!Number.isInteger(idMarca)) throw new ValidationError("Selecciona primero la marca del modelo");
    const marca = await Marca.findByPk(idMarca, { include: [{ model: TipoProducto, as: "tipoProducto" }] });
    if (!marca) throw new ValidationError("La marca seleccionada no existe");
    if (!marca.tipoProducto?.requiereModeloMedidas) {
      throw new ValidationError(
        `La marca "${marca.nombre}" pertenece a "${marca.tipoProducto?.nombre}", que no usa modelos ni medidas`
      );
    }
    return marca;
  }

  async _validarTipoUso(idTipoUso) {
    if (idTipoUso === null) return null;
    if (!Number.isInteger(idTipoUso) || !(await TipoUso.findByPk(idTipoUso))) {
      throw new ValidationError("El tipo de uso seleccionado no existe");
    }
    return idTipoUso;
  }

  async crearModelo(data = {}) {
    const nombre = aTexto(data.nombre);
    if (!nombre) throw new ValidationError("El nombre del modelo es obligatorio");
    if (nombre.length > 100) throw new ValidationError("El nombre no puede superar 100 caracteres");
    const marca = await this._validarMarcaDeModelo(aEntero(data.idMarca));
    const idTipoUso = await this._validarTipoUso(aEntero(data.idTipoUso));

    if (await Modelo.findOne({ where: { idMarca: marca.idMarca, nombre: mismoNombre(nombre) } })) {
      throw new ConflictError(`El modelo "${nombre}" ya existe para la marca "${marca.nombre}"`);
    }
    const modelo = await Modelo.create({
      idMarca: marca.idMarca,
      idTipoUso,
      nombre,
      activo: aBooleano(data.activo, true),
    });
    return this._obtenerModelo(modelo.idModelo);
  }

  async actualizarModelo(id, data = {}) {
    const modelo = await Modelo.findByPk(id);
    if (!modelo) throw new NotFoundError("Modelo no encontrado");
    const cambios = {};

    if (data.idMarca !== undefined && aEntero(data.idMarca) !== modelo.idMarca) {
      const productos = await Producto.count({ where: { idModelo: modelo.idModelo } });
      if (productos > 0) {
        throw new ConflictError(
          `No se puede cambiar la marca de "${modelo.nombre}" porque ${productos} producto(s) lo usan.`
        );
      }
      cambios.idMarca = (await this._validarMarcaDeModelo(aEntero(data.idMarca))).idMarca;
    }
    if (data.nombre !== undefined) {
      const nombre = aTexto(data.nombre);
      if (!nombre) throw new ValidationError("El nombre del modelo es obligatorio");
      cambios.nombre = nombre;
    }
    const idMarcaFinal = cambios.idMarca || modelo.idMarca;
    const nombreFinal = cambios.nombre || modelo.nombre;
    const duplicado = await Modelo.findOne({
      where: { idMarca: idMarcaFinal, nombre: mismoNombre(nombreFinal), idModelo: { [Op.ne]: modelo.idModelo } },
    });
    if (duplicado) throw new ConflictError(`El modelo "${nombreFinal}" ya existe para esa marca`);

    if (data.idTipoUso !== undefined) cambios.idTipoUso = await this._validarTipoUso(aEntero(data.idTipoUso));
    if (data.activo !== undefined) cambios.activo = aBooleano(data.activo, true);

    await modelo.update(cambios);
    return this._obtenerModelo(modelo.idModelo);
  }

  async eliminarModelo(id) {
    const modelo = await Modelo.findByPk(id);
    if (!modelo) throw new NotFoundError("Modelo no encontrado");
    const productos = await Producto.count({ where: { idModelo: modelo.idModelo } });
    if (productos > 0) {
      throw new ConflictError(
        `No se puede eliminar "${modelo.nombre}" porque ${productos} producto(s) lo usan. Puedes desactivarlo.`
      );
    }
    await modelo.destroy();
    return { idModelo: modelo.idModelo, message: "Modelo eliminado correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Tipos de uso del modelo (AT, MT, HP…) — dato informativo
  // ═══════════════════════════════════════════════════════════════════════════
  async listarTiposUso() {
    return TipoUso.findAll({
      attributes: {
        include: [contar(`SELECT COUNT(*) FROM modelos mo WHERE mo.id_tipo_uso = "TipoUso"."id_tipo_uso"`, "totalModelos")],
      },
      order: [["descripcion", "ASC"]],
    });
  }

  async crearTipoUso(data = {}) {
    const codigo = aTexto(data.codigo).toUpperCase();
    const descripcion = aTexto(data.descripcion);
    const errores = [];
    if (!codigo) errores.push("El código del tipo de uso es obligatorio (ej: AT)");
    if (codigo.length > 5) errores.push("El código no puede superar 5 caracteres");
    if (!descripcion) errores.push("La descripción es obligatoria (ej: Todo Terreno)");
    if (descripcion.length > 150) errores.push("La descripción no puede superar 150 caracteres");
    lanzarSiHayErrores(errores);
    if (await TipoUso.findOne({ where: { codigo: mismoNombre(codigo) } })) {
      throw new ConflictError(`Ya existe el tipo de uso "${codigo}"`);
    }
    return TipoUso.create({ codigo, descripcion });
  }

  async actualizarTipoUso(id, data = {}) {
    const tipoUso = await TipoUso.findByPk(id);
    if (!tipoUso) throw new NotFoundError("Tipo de uso no encontrado");
    const cambios = {};
    if (data.codigo !== undefined) {
      const codigo = aTexto(data.codigo).toUpperCase();
      if (!codigo || codigo.length > 5) throw new ValidationError("El código debe tener entre 1 y 5 caracteres");
      const duplicado = await TipoUso.findOne({
        where: { codigo: mismoNombre(codigo), idTipoUso: { [Op.ne]: tipoUso.idTipoUso } },
      });
      if (duplicado) throw new ConflictError(`Ya existe el tipo de uso "${codigo}"`);
      cambios.codigo = codigo;
    }
    if (data.descripcion !== undefined) {
      const descripcion = aTexto(data.descripcion);
      if (!descripcion) throw new ValidationError("La descripción es obligatoria");
      cambios.descripcion = descripcion;
    }
    await tipoUso.update(cambios);
    return tipoUso;
  }

  async eliminarTipoUso(id) {
    const tipoUso = await TipoUso.findByPk(id);
    if (!tipoUso) throw new NotFoundError("Tipo de uso no encontrado");
    const modelos = await Modelo.count({ where: { idTipoUso: tipoUso.idTipoUso } });
    if (modelos > 0) {
      throw new ConflictError(`No se puede eliminar "${tipoUso.codigo}" porque ${modelos} modelo(s) lo usan.`);
    }
    await tipoUso.destroy();
    return { idTipoUso: tipoUso.idTipoUso, message: "Tipo de uso eliminado correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Medidas: anchos / altos / aros
  // ═══════════════════════════════════════════════════════════════════════════
  _configMedida(tipo) {
    const config = MEDIDAS[tipo];
    if (!config) throw new NotFoundError("Tipo de medida no válido. Usa: anchos, altos o aros");
    return config;
  }

  _validarValorMedida(valorCrudo, etiqueta) {
    const valor = aDecimal(valorCrudo);
    if (valor === null || Number.isNaN(valor)) throw new ValidationError(`El ${etiqueta} debe ser un número`);
    if (valor <= 0 || valor >= 10000) throw new ValidationError(`El ${etiqueta} debe ser mayor a 0 y menor a 10000`);
    return Math.round(valor * 100) / 100;
  }

  async listarMedidas(tipo, { todos = false } = {}) {
    const { Modelo: ModeloMedida, campo, nombreModelo } = this._configMedida(tipo);
    return ModeloMedida.findAll({
      where: todos ? {} : { activo: true },
      attributes: {
        include: [
          contar(
            `SELECT COUNT(*) FROM producto_medidas pm WHERE pm.${campo} = "${nombreModelo}"."${campo}"`,
            "totalProductos"
          ),
        ],
      },
      order: [["valor", "ASC"]],
    });
  }

  async crearMedida(tipo, data = {}) {
    const { Modelo: ModeloMedida, etiqueta } = this._configMedida(tipo);
    const valor = this._validarValorMedida(data.valor, etiqueta);
    if (await ModeloMedida.findOne({ where: { valor } })) {
      throw new ConflictError(`El ${etiqueta} ${valor} ya existe`);
    }
    return ModeloMedida.create({ valor, activo: aBooleano(data.activo, true) });
  }

  // Alta masiva (usada para importar las medidas que antes vivían en el navegador)
  async crearMedidasLote(tipo, data = {}) {
    const { Modelo: ModeloMedida, etiqueta } = this._configMedida(tipo);
    const valores = aLista(data.valores) || [];
    const resultado = { creados: [], existentes: 0, invalidos: 0 };
    for (const valorCrudo of valores) {
      let valor;
      try {
        valor = this._validarValorMedida(valorCrudo, etiqueta);
      } catch {
        resultado.invalidos += 1;
        continue;
      }
      const [registro, creado] = await ModeloMedida.findOrCreate({ where: { valor }, defaults: { valor } });
      if (creado) resultado.creados.push(registro);
      else resultado.existentes += 1;
    }
    return resultado;
  }

  async actualizarMedida(tipo, id, data = {}) {
    const { Modelo: ModeloMedida, pk, etiqueta } = this._configMedida(tipo);
    const medida = await ModeloMedida.findByPk(id);
    if (!medida) throw new NotFoundError(`${etiqueta[0].toUpperCase()}${etiqueta.slice(1)} no encontrado`);
    const cambios = {};
    if (data.valor !== undefined) {
      const valor = this._validarValorMedida(data.valor, etiqueta);
      if (valor !== medida.valor) {
        const [enUso] = await sequelize.query(
          `SELECT COUNT(*) AS total FROM producto_medidas WHERE ${MEDIDAS[tipo].campo} = :id`,
          { replacements: { id: medida[pk] }, type: sequelize.QueryTypes.SELECT }
        );
        if (Number(enUso.total) > 0) {
          throw new ConflictError(
            `No se puede cambiar el valor porque ${enUso.total} producto(s) usan este ${etiqueta}. Crea una medida nueva.`
          );
        }
        if (await ModeloMedida.findOne({ where: { valor, [pk]: { [Op.ne]: medida[pk] } } })) {
          throw new ConflictError(`El ${etiqueta} ${valor} ya existe`);
        }
        cambios.valor = valor;
      }
    }
    if (data.activo !== undefined) cambios.activo = aBooleano(data.activo, true);
    await medida.update(cambios);
    return medida;
  }

  async eliminarMedida(tipo, id) {
    const { Modelo: ModeloMedida, pk, campo, etiqueta } = this._configMedida(tipo);
    const medida = await ModeloMedida.findByPk(id);
    if (!medida) throw new NotFoundError(`${etiqueta[0].toUpperCase()}${etiqueta.slice(1)} no encontrado`);
    const [enUso] = await sequelize.query(`SELECT COUNT(*) AS total FROM producto_medidas WHERE ${campo} = :id`, {
      replacements: { id: medida[pk] },
      type: sequelize.QueryTypes.SELECT,
    });
    if (Number(enUso.total) > 0) {
      throw new ConflictError(
        `No se puede eliminar el ${etiqueta} ${medida.valor} porque ${enUso.total} producto(s) lo usan. Puedes desactivarlo.`
      );
    }
    await medida.destroy();
    return { [pk]: medida[pk], message: "Medida eliminada correctamente" };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Especificaciones técnicas (con los tipos de producto a los que aplican)
  // ═══════════════════════════════════════════════════════════════════════════
  async listarEspecificaciones({ idTipoProducto = null, todos = false } = {}) {
    return EspecificacionTecnica.findAll({
      where: todos ? {} : { activo: true },
      include: [
        {
          model: TipoProducto,
          as: "tiposProducto",
          attributes: ["idTipoProducto", "nombre"],
          through: { attributes: [] },
          ...(idTipoProducto ? { where: { idTipoProducto: aEntero(idTipoProducto) }, required: true } : {}),
        },
      ],
      attributes: {
        include: [
          contar(
            `SELECT COUNT(*) FROM producto_especificaciones pe WHERE pe.id_especificacion = "EspecificacionTecnica"."id_especificacion"`,
            "totalProductos"
          ),
        ],
      },
      order: [["nombre", "ASC"]],
    });
  }

  async _obtenerEspecificacion(id) {
    const especificacion = await EspecificacionTecnica.findByPk(id, {
      include: [
        { model: TipoProducto, as: "tiposProducto", attributes: ["idTipoProducto", "nombre"], through: { attributes: [] } },
      ],
    });
    if (!especificacion) throw new NotFoundError("Especificación técnica no encontrada");
    return especificacion;
  }

  async _validarTiposDeEspecificacion(valor) {
    const ids = [...new Set((aLista(valor) || []).map(aEntero).filter(Number.isInteger))];
    if (ids.length === 0) {
      throw new ValidationError("Selecciona al menos un tipo de producto al que aplica la especificación");
    }
    const encontrados = await TipoProducto.count({ where: { idTipoProducto: ids } });
    if (encontrados !== ids.length) throw new ValidationError("Uno de los tipos de producto seleccionados no existe");
    return ids;
  }

  async crearEspecificacion(data = {}, archivo = null) {
    try {
      const nombre = aTexto(data.nombre);
      if (!nombre) throw new ValidationError("El nombre de la especificación es obligatorio");
      if (nombre.length > 100) throw new ValidationError("El nombre no puede superar 100 caracteres");
      if (await EspecificacionTecnica.findOne({ where: { nombre: mismoNombre(nombre) } })) {
        throw new ConflictError(`La especificación "${nombre}" ya existe`);
      }
      const idsTipoProducto = await this._validarTiposDeEspecificacion(data.idsTipoProducto);
      const errores = [];
      const iconoUrl = resolverImagen({ archivo, url: data.iconoUrl }, "ícono", errores);
      lanzarSiHayErrores(errores);

      const idEspecificacion = await sequelize.transaction(async (transaction) => {
        const especificacion = await EspecificacionTecnica.create(
          { nombre, iconoUrl, activo: aBooleano(data.activo, true) },
          { transaction }
        );
        await especificacion.setTiposProducto(idsTipoProducto, { transaction });
        return especificacion.idEspecificacion;
      });
      return this._obtenerEspecificacion(idEspecificacion);
    } catch (error) {
      await eliminarArchivosSubidos(archivo);
      throw error;
    }
  }

  async actualizarEspecificacion(id, data = {}, archivo = null) {
    try {
      const especificacion = await this._obtenerEspecificacion(id);
      const cambios = {};
      const errores = [];

      if (data.nombre !== undefined) {
        const nombre = aTexto(data.nombre);
        if (!nombre) throw new ValidationError("El nombre de la especificación es obligatorio");
        const duplicado = await EspecificacionTecnica.findOne({
          where: { nombre: mismoNombre(nombre), idEspecificacion: { [Op.ne]: especificacion.idEspecificacion } },
        });
        if (duplicado) throw new ConflictError(`La especificación "${nombre}" ya existe`);
        cambios.nombre = nombre;
      }
      if (data.activo !== undefined) cambios.activo = aBooleano(data.activo, true);
      cambios.iconoUrl = resolverImagen(
        { archivo, url: data.iconoUrl, quitar: data.quitarIcono, actual: especificacion.iconoUrl },
        "ícono",
        errores
      );
      lanzarSiHayErrores(errores);

      let idsTipoProducto = null;
      if (data.idsTipoProducto !== undefined) {
        idsTipoProducto = await this._validarTiposDeEspecificacion(data.idsTipoProducto);
        const quitados = especificacion.tiposProducto
          .map((t) => t.idTipoProducto)
          .filter((idTipo) => !idsTipoProducto.includes(idTipo));
        if (quitados.length > 0) {
          const enUso = await ProductoEspecificacion.count({
            where: { idEspecificacion: especificacion.idEspecificacion },
            include: [{ model: Producto, as: "producto", where: { idTipoProducto: quitados }, required: true }],
          });
          if (enUso > 0) {
            throw new ConflictError(
              `No se puede quitar ese tipo de producto: ${enUso} producto(s) de ese tipo usan "${especificacion.nombre}".`
            );
          }
        }
      }

      await sequelize.transaction(async (transaction) => {
        await especificacion.update(cambios, { transaction });
        if (idsTipoProducto) await especificacion.setTiposProducto(idsTipoProducto, { transaction });
      });
      return this._obtenerEspecificacion(especificacion.idEspecificacion);
    } catch (error) {
      await eliminarArchivosSubidos(archivo);
      throw error;
    }
  }

  async eliminarEspecificacion(id) {
    const especificacion = await EspecificacionTecnica.findByPk(id);
    if (!especificacion) throw new NotFoundError("Especificación técnica no encontrada");
    const enUso = await ProductoEspecificacion.count({ where: { idEspecificacion: especificacion.idEspecificacion } });
    if (enUso > 0) {
      throw new ConflictError(
        `No se puede eliminar "${especificacion.nombre}" porque ${enUso} producto(s) la usan. Puedes desactivarla.`
      );
    }
    await especificacion.destroy();
    return { idEspecificacion: especificacion.idEspecificacion, message: "Especificación eliminada correctamente" };
  }
}

module.exports = new NivelesService();
