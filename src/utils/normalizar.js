"use strict";

// Helpers para normalizar datos que llegan como JSON o como multipart (todo string)

// null si viene vacío, NaN si no es entero
const aEntero = (valor) => {
  if (valor === undefined || valor === null || valor === "") return null;
  const numero = Number(valor);
  return Number.isInteger(numero) ? numero : NaN;
};

// Acepta "12,5" o "12.5". null si viene vacío, NaN si no es numérico
const aDecimal = (valor) => {
  if (valor === undefined || valor === null || valor === "") return null;
  const numero = Number(String(valor).replace(",", "."));
  return Number.isFinite(numero) ? numero : NaN;
};

const aBooleano = (valor, porDefecto = false) => {
  if (valor === undefined || valor === null || valor === "") return porDefecto;
  if (typeof valor === "boolean") return valor;
  return ["true", "1", "on", "si", "sí"].includes(String(valor).toLowerCase());
};

// Acepta array, JSON string ("[1,2]") o lista separada por comas ("1,2"). undefined si no viene
const aLista = (valor) => {
  if (valor === undefined || valor === null || valor === "") return undefined;
  if (Array.isArray(valor)) return valor;
  if (typeof valor === "string") {
    try {
      const parseado = JSON.parse(valor);
      return Array.isArray(parseado) ? parseado : [parseado];
    } catch {
      return valor.split(",").map((v) => v.trim()).filter(Boolean);
    }
  }
  return [valor];
};

const aTexto = (valor) => (typeof valor === "string" || typeof valor === "number" ? String(valor).trim() : "");

// Para comparar nombres sin distinguir mayúsculas con iLike sin comodines
const escaparLike = (texto) => String(texto).replace(/[\\%_]/g, (c) => `\\${c}`);

const esUrlValida = (url) => /^https?:\/\/\S+$/i.test(url) && url.length <= 500;

module.exports = { aEntero, aDecimal, aBooleano, aLista, aTexto, escaparLike, esUrlValida };
