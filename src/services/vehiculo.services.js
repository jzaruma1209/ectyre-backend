const { MarcaVehiculo, ModeloVehiculo } = require("../models");

class VehiculoService {
  // Obtener todas las marcas de vehículos activas
  async getMarcas() {
    try {
      const marcas = await MarcaVehiculo.findAll({
        where: { activo: true },
        attributes: ["idMarcaVehiculo", "nombre", "logoUrl"],
        order: [["nombre", "ASC"]],
      });
      return marcas;
    } catch (error) {
      throw new Error(`Error al obtener marcas de vehículos: ${error.message}`);
    }
  }

  // Obtener modelos de una marca específica
  async getModelosByMarca(idMarcaVehiculo) {
    try {
      const marca = await MarcaVehiculo.findByPk(idMarcaVehiculo);
      if (!marca) {
        throw new Error("Marca de vehículo no encontrada");
      }

      const modelos = await ModeloVehiculo.findAll({
        where: { idMarcaVehiculo },
        attributes: ["idModelo", "nombre", "tipoVehiculo"],
        order: [["nombre", "ASC"]],
      });

      return { marca: { idMarcaVehiculo: marca.idMarcaVehiculo, nombre: marca.nombre }, modelos };
    } catch (error) {
      throw new Error(`Error al obtener modelos: ${error.message}`);
    }
  }

  // Obtener todas las marcas con sus modelos (para selects anidados)
  async getMarcasConModelos() {
    try {
      const marcas = await MarcaVehiculo.findAll({
        where: { activo: true },
        attributes: ["idMarcaVehiculo", "nombre", "logoUrl"],
        include: [
          {
            model: ModeloVehiculo,
            as: "modelos",
            attributes: ["idModelo", "nombre", "tipoVehiculo"],
            order: [["nombre", "ASC"]],
          },
        ],
        order: [["nombre", "ASC"]],
      });
      return marcas;
    } catch (error) {
      throw new Error(`Error al obtener marcas con modelos: ${error.message}`);
    }
  }
}

module.exports = new VehiculoService();
