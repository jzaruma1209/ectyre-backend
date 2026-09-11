const { TipoProducto, Marca, Producto } = require("../../models");

/**
 * Crea un producto simple (flujo B: sin modelo ni medidas) con su tipo y marca.
 * Devuelve { tipo, marca, producto, limpiar } — `limpiar` borra solo lo creado aquí.
 */
const crearProductoDePrueba = async ({ nombre = "Producto Test", precio = 100, stock = 10 } = {}) => {
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const tipo = await TipoProducto.create({
    codigo: `T${sufijo}`.slice(0, 10),
    nombre: `TIPO TEST ${sufijo}`,
    requiereModeloMedidas: false,
  });
  const marca = await Marca.create({ idTipoProducto: tipo.idTipoProducto, nombre: `Marca Test ${sufijo}` });
  const producto = await Producto.create({
    idTipoProducto: tipo.idTipoProducto,
    idMarca: marca.idMarca,
    nombre,
    precio,
    stock,
    activo: true,
  });

  const limpiar = async () => {
    await Producto.destroy({ where: { idMarca: marca.idMarca } });
    await marca.destroy();
    await tipo.destroy();
  };

  return { tipo, marca, producto, limpiar };
};

module.exports = { crearProductoDePrueba };
