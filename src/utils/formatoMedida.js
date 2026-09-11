"use strict";

// 225.00 → "225", 22.50 → "22.5"
const formatearValorMedida = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? String(numero) : null;
};

/**
 * Combina ancho / alto / aro en formato legible de llanta: "225/75R15".
 * Devuelve null si falta alguna de las tres medidas.
 */
const formatearMedida = (ancho, alto, aro) => {
  const [a, h, r] = [ancho, alto, aro].map(formatearValorMedida);
  if (!a || !h || !r) return null;
  return `${a}/${h}R${r}`;
};

module.exports = { formatearValorMedida, formatearMedida };
