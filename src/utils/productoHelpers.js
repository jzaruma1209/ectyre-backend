"use strict";

const {
  TipoProducto,
  Marca,
  Modelo,
  TipoUso,
  ProductoMedida,
  Ancho,
  Alto,
  Aro,
  ProductoEspecificacion,
  EspecificacionTecnica,
  ImagenProducto,
  ImagenPromocion,
} = require("../models");
const { formatearMedida } = require("./formatoMedida");

const aNumero = (valor) => (valor === null || valor === undefined || valor === "" ? null : Number(valor));

// ─── Includes ────────────────────────────────────────────────────────────────

/**
 * Include de medidas. Si se pasa algún filtro (ancho/alto/aro) la relación pasa
 * a ser obligatoria (INNER JOIN) y solo devuelve productos con esa medida.
 */
const includeMedidas = ({ ancho = null, alto = null, aro = null } = {}) => {
  const filtrar = (valor) => (valor !== null && valor !== undefined ? { where: { valor }, required: true } : {});
  return {
    model: ProductoMedida,
    as: "medidas",
    required: [ancho, alto, aro].some((v) => v !== null && v !== undefined),
    include: [
      { model: Ancho, as: "ancho", attributes: ["idAncho", "valor"], ...filtrar(ancho) },
      { model: Alto, as: "alto", attributes: ["idAlto", "valor"], ...filtrar(alto) },
      { model: Aro, as: "aro", attributes: ["idAro", "valor"], ...filtrar(aro) },
    ],
  };
};

// Todo lo que el card / detalle / formulario admin necesita
const includeProductoCompleto = (filtrosMedida) => [
  {
    model: TipoProducto,
    as: "tipoProducto",
    attributes: ["idTipoProducto", "codigo", "nombre", "requiereModeloMedidas"],
  },
  {
    model: Marca,
    as: "marca",
    attributes: ["idMarca", "idTipoProducto", "nombre", "logoUrl", "bannerUrl"],
  },
  {
    model: Modelo,
    as: "modelo",
    required: false,
    attributes: ["idModelo", "idMarca", "nombre", "idTipoUso"],
    include: [
      { model: TipoUso, as: "tipoUso", required: false, attributes: ["idTipoUso", "codigo", "descripcion"] },
    ],
  },
  includeMedidas(filtrosMedida),
  {
    model: ProductoEspecificacion,
    as: "especificaciones",
    required: false,
    attributes: ["idProductoEspecificacion", "idEspecificacion", "valor"],
    include: [
      { model: EspecificacionTecnica, as: "especificacion", attributes: ["idEspecificacion", "nombre", "iconoUrl"] },
    ],
  },
  {
    model: ImagenProducto,
    as: "imagenes",
    required: false,
    attributes: ["idImagen", "urlImagen", "tipoImagen", "orden"],
  },
  {
    model: ImagenPromocion,
    as: "imagenPromocion",
    required: false,
    attributes: ["idImagenPromocion", "urlImagen", "nombre"],
  },
];

// Versión liviana para carrito, pedidos y reportes
const includeProductoResumen = () => [
  { model: Marca, as: "marca", attributes: ["idMarca", "nombre", "logoUrl"] },
  { model: Modelo, as: "modelo", required: false, attributes: ["idModelo", "nombre"] },
  includeMedidas(),
  {
    model: ImagenProducto,
    as: "imagenes",
    where: { tipoImagen: "PRINCIPAL" },
    required: false,
    attributes: ["idImagen", "urlImagen", "tipoImagen", "orden"],
  },
];

// ─── Contrato de datos del card (sección 7 de la arquitectura) ───────────────

const serializarProducto = (instancia) => {
  if (!instancia) return null;
  const p = typeof instancia.get === "function" ? instancia.get({ plain: true }) : instancia;

  const precio = aNumero(p.precio);
  const precioAnterior = aNumero(p.precioAnterior);
  const descuentoPorcentaje =
    precio && precioAnterior && precioAnterior > precio
      ? Math.round(((precioAnterior - precio) / precioAnterior) * 100)
      : null;

  const imagenes = [...(p.imagenes || [])]
    .sort((a, b) => a.orden - b.orden || a.idImagen - b.idImagen)
    .map((img) => ({
      idImagen: img.idImagen,
      urlImagen: img.urlImagen,
      esPrincipal: img.tipoImagen === "PRINCIPAL",
      orden: img.orden,
    }));
  const principal = imagenes.find((img) => img.esPrincipal) || imagenes[0] || null;

  const m = p.medidas;
  const medidas = m
    ? {
        idAncho: m.idAncho,
        idAlto: m.idAlto,
        idAro: m.idAro,
        ancho: aNumero(m.ancho?.valor),
        alto: aNumero(m.alto?.valor),
        aro: aNumero(m.aro?.valor),
        texto: formatearMedida(m.ancho?.valor, m.alto?.valor, m.aro?.valor),
      }
    : null;

  const stock = Number(p.stock) || 0;

  return {
    idProducto: p.idProducto,
    nombre: p.nombre,
    descripcion: p.descripcion || "",
    tipoProducto: p.tipoProducto
      ? {
          idTipoProducto: p.tipoProducto.idTipoProducto,
          codigo: p.tipoProducto.codigo,
          nombre: p.tipoProducto.nombre,
          requiereModeloMedidas: Boolean(p.tipoProducto.requiereModeloMedidas),
        }
      : null,
    marca: p.marca
      ? {
          idMarca: p.marca.idMarca,
          nombre: p.marca.nombre,
          logoUrl: p.marca.logoUrl || null,
          bannerUrl: p.marca.bannerUrl || null,
        }
      : null,
    modelo: p.modelo
      ? {
          idModelo: p.modelo.idModelo,
          nombre: p.modelo.nombre,
          tipoUso: p.modelo.tipoUso
            ? {
                idTipoUso: p.modelo.tipoUso.idTipoUso,
                codigo: p.modelo.tipoUso.codigo,
                descripcion: p.modelo.tipoUso.descripcion,
              }
            : null,
        }
      : null,
    medidas,
    precio,
    precioAnterior,
    descuentoPorcentaje,
    stock,
    disponible: p.activo !== false && stock > 0,
    especificaciones: [...(p.especificaciones || [])]
      .filter((pe) => pe.especificacion)
      .sort((a, b) => a.idProductoEspecificacion - b.idProductoEspecificacion)
      .map((pe) => ({
        idEspecificacion: pe.idEspecificacion,
        nombre: pe.especificacion.nombre,
        iconoUrl: pe.especificacion.iconoUrl || null,
        valor: pe.valor,
      })),
    imagenes,
    imagenPrincipal: principal ? principal.urlImagen : null,
    esNuevo: Boolean(p.esNuevo),
    enOferta: Boolean(p.enOferta),
    envioGratis: Boolean(p.envioGratis),
    aplicaDevoluciones: Boolean(p.aplicaDevoluciones),
    aplicaGarantia: Boolean(p.aplicaGarantia),
    activo: p.activo !== false,
    destacado: Boolean(p.destacado),
    imagenPromocion: p.imagenPromocion
      ? {
          idImagenPromocion: p.imagenPromocion.idImagenPromocion,
          urlImagen: p.imagenPromocion.urlImagen,
          nombre: p.imagenPromocion.nombre,
        }
      : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

module.exports = {
  includeMedidas,
  includeProductoCompleto,
  includeProductoResumen,
  serializarProducto,
};
