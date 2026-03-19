const {
  Carrito,
  ItemCarrito,
  Llanta,
  MarcaLlanta,
  ImagenLlanta,
} = require("../models");
const { NotFoundError, ValidationError } = require("../utils/customErrors");
const { Op } = require("sequelize");

class CarritoService {
  // Obtener o crear carrito
  async getOrCreateCarrito(idCliente, sesionId = null) {
    let carrito;

    if (idCliente) {
      // Buscar carrito activo del cliente
      carrito = await Carrito.findOne({
        where: { idCliente, estado: "ACTIVO" },
        include: [
          {
            model: ItemCarrito,
            as: "items",
            include: [
              {
                model: Llanta,
                as: "llanta",
                include: [
                  { model: MarcaLlanta, as: "marca" },
                  {
                    model: ImagenLlanta,
                    as: "imagenes",
                    where: { tipoImagen: "PRINCIPAL" },
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!carrito) {
        carrito = await Carrito.create({ idCliente, estado: "ACTIVO" });
      }
    } else if (sesionId) {
      // Carrito de invitado
      carrito = await Carrito.findOne({
        where: { sesionId, estado: "ACTIVO" },
        include: [
          {
            model: ItemCarrito,
            as: "items",
            include: [
              {
                model: Llanta,
                as: "llanta",
                include: [
                  { model: MarcaLlanta, as: "marca" },
                  {
                    model: ImagenLlanta,
                    as: "imagenes",
                    where: { tipoImagen: "PRINCIPAL" },
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!carrito) {
        carrito = await Carrito.create({ sesionId, estado: "ACTIVO" });
      }
    } else {
      throw new ValidationError("Se requiere idCliente o sesionId");
    }

    return carrito;
  }

  // Agregar item al carrito
  async agregarItem(carritoId, idLlanta, cantidad) {
    const carrito = await Carrito.findByPk(carritoId);
    if (!carrito) {
      throw new NotFoundError("Carrito no encontrado");
    }

    const llanta = await Llanta.findByPk(idLlanta);
    if (!llanta) {
      throw new NotFoundError("Llanta no encontrada");
    }

    if (!llanta.activo) {
      throw new ValidationError("Llanta no disponible");
    }

    if (llanta.stock < cantidad) {
      throw new ValidationError(
        `Stock insuficiente. Disponible: ${llanta.stock}`
      );
    }

    // Verificar si ya existe el item
    let item = await ItemCarrito.findOne({
      where: { idCarrito: carritoId, idLlanta },
    });

    if (item) {
      // Actualizar cantidad
      const nuevaCantidad = item.cantidad + cantidad;
      if (llanta.stock < nuevaCantidad) {
        throw new ValidationError(
          `Stock insuficiente. Disponible: ${llanta.stock}`
        );
      }
      await item.update({ cantidad: nuevaCantidad });
    } else {
      // Crear nuevo item
      const precio = llanta.precioOferta || llanta.precio;
      item = await ItemCarrito.create({
        idCarrito: carritoId,
        idLlanta,
        cantidad,
        precioUnitario: precio,
      });
    }

    return await this.getCarritoDetallado(carritoId);
  }

  // Actualizar cantidad de item
  async actualizarItem(itemId, cantidad) {
    const item = await ItemCarrito.findByPk(itemId, {
      include: [{ model: Llanta, as: "llanta" }],
    });

    if (!item) {
      throw new NotFoundError("Item no encontrado");
    }

    if (cantidad <= 0) {
      throw new ValidationError("La cantidad debe ser mayor a 0");
    }

    if (item.llanta.stock < cantidad) {
      throw new ValidationError(
        `Stock insuficiente. Disponible: ${item.llanta.stock}`
      );
    }

    await item.update({ cantidad });

    return await this.getCarritoDetallado(item.idCarrito);
  }

  // Eliminar item
  async eliminarItem(itemId) {
    const item = await ItemCarrito.findByPk(itemId);
    if (!item) {
      throw new NotFoundError("Item no encontrado");
    }

    const carritoId = item.idCarrito;
    await item.destroy();

    return await this.getCarritoDetallado(carritoId);
  }

  // Vaciar carrito
  async vaciarCarrito(carritoId) {
    await ItemCarrito.destroy({ where: { idCarrito: carritoId } });
    return { message: "Carrito vaciado correctamente" };
  }

  // Obtener carrito detallado
  async getCarritoDetallado(carritoId) {
    const carrito = await Carrito.findByPk(carritoId, {
      include: [
        {
          model: ItemCarrito,
          as: "items",
          include: [
            {
              model: Llanta,
              as: "llanta",
              include: [
                { model: MarcaLlanta, as: "marca" },
                {
                  model: ImagenLlanta,
                  as: "imagenes",
                  where: { tipoImagen: "PRINCIPAL" },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!carrito) {
      throw new NotFoundError("Carrito no encontrado");
    }

    // Calcular totales
    let subtotal = 0;
    carrito.items.forEach((item) => {
      subtotal += parseFloat(item.precioUnitario) * item.cantidad;
    });

    const iva = subtotal * 0.15; // 15% IVA
    const total = subtotal + iva;

    return {
      carrito,
      resumen: {
        cantidadItems: carrito.items.length,
        subtotal: subtotal.toFixed(2),
        iva: iva.toFixed(2),
        total: total.toFixed(2),
      },
    };
  }
}

module.exports = new CarritoService();
