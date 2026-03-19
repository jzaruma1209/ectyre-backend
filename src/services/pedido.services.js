const {
  Pedido,
  DetallePedido,
  Pago,
  Carrito,
  ItemCarrito,
  Llanta,
  MarcaLlanta,
  Direccion,
  MetodoPago,
} = require("../models");
const { sequelize } = require("../models");

class PedidoService {
  // Generar número de pedido único: P-YYYY-XXXXX
  _generarNumeroPedido() {
    const anio = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `P-${anio}-${random}`;
  }

  // Checkout: crear pedido desde el carrito activo del cliente
  async checkout(idCliente, data) {
    const { idDireccionEntrega, idMetodoPago, requiereInstalacion, observaciones } = data;

    const t = await sequelize.transaction();

    try {
      // 1. Verificar que la dirección pertenece al cliente
      const direccion = await Direccion.findOne({
        where: { idDireccion: idDireccionEntrega, idCliente },
        transaction: t,
      });
      if (!direccion) {
        throw new Error("La dirección de entrega no es válida");
      }

      // 2. Verificar método de pago
      const metodoPago = await MetodoPago.findByPk(idMetodoPago, {
        transaction: t,
      });
      if (!metodoPago) {
        throw new Error("El método de pago no es válido");
      }

      // 3. Obtener carrito activo del cliente con sus items
      const carrito = await Carrito.findOne({
        where: { idCliente, estado: "ACTIVO" },
        include: [
          {
            model: ItemCarrito,
            as: "items",
            include: [
              {
                model: Llanta,
                as: "llanta",
                attributes: ["idLlanta", "modelo", "precio", "stock", "activo"],
              },
            ],
          },
        ],
        transaction: t,
      });

      if (!carrito || !carrito.items || carrito.items.length === 0) {
        throw new Error("El carrito está vacío");
      }

      // 4. Validar stock de cada item
      for (const item of carrito.items) {
        if (!item.llanta.activo) {
          throw new Error(
            `La llanta "${item.llanta.modelo}" ya no está disponible`
          );
        }
        if (item.llanta.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${item.llanta.modelo}". Disponible: ${item.llanta.stock}`
          );
        }
      }

      // 5. Calcular totales
      const subtotal = carrito.items.reduce(
        (acc, item) => acc + parseFloat(item.precioUnitario) * item.cantidad,
        0
      );
      const iva = parseFloat((subtotal * 0.15).toFixed(2)); // IVA 15% Ecuador
      const costoEnvio = 0; // Se puede extender en Etapa 2
      const total = parseFloat((subtotal + iva + costoEnvio).toFixed(2));

      // 6. Crear el pedido
      const pedido = await Pedido.create(
        {
          numeroPedido: this._generarNumeroPedido(),
          idCliente,
          idDireccionEntrega,
          subtotal: subtotal.toFixed(2),
          iva: iva.toFixed(2),
          costoEnvio: costoEnvio.toFixed(2),
          total: total.toFixed(2),
          estado: "PENDIENTE",
          requiereInstalacion: requiereInstalacion || false,
          observaciones: observaciones || null,
        },
        { transaction: t }
      );

      // 7. Crear los detalles del pedido y descontar stock
      for (const item of carrito.items) {
        await DetallePedido.create(
          {
            idPedido: pedido.idPedido,
            idLlanta: item.idLlanta,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: (parseFloat(item.precioUnitario) * item.cantidad).toFixed(2),
          },
          { transaction: t }
        );

        // Descontar stock de la llanta
        await Llanta.update(
          { stock: item.llanta.stock - item.cantidad },
          { where: { idLlanta: item.idLlanta }, transaction: t }
        );
      }

      // 8. Crear el registro de pago
      await Pago.create(
        {
          idPedido: pedido.idPedido,
          idMetodoPago,
          monto: total.toFixed(2),
          estadoPago: "PENDIENTE",
        },
        { transaction: t }
      );

      // 9. Marcar el carrito como convertido
      await carrito.update({ estado: "CONVERTIDO" }, { transaction: t });

      await t.commit();

      // 10. Retornar el pedido completo
      const pedidoCompleto = await this.getPedidoById(
        pedido.idPedido,
        idCliente
      );
      return pedidoCompleto;
    } catch (error) {
      await t.rollback();
      throw new Error(`Error al procesar el pedido: ${error.message}`);
    }
  }

  // Listar todos los pedidos de un cliente
  async getPedidos(idCliente) {
    try {
      const pedidos = await Pedido.findAll({
        where: { idCliente },
        include: [
          {
            model: DetallePedido,
            as: "detalles",
            include: [
              {
                model: Llanta,
                as: "llanta",
                attributes: ["idLlanta", "modelo", "ancho", "perfil", "rin"],
                include: [
                  {
                    model: MarcaLlanta,
                    as: "marca",
                    attributes: ["idMarca", "nombre"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return pedidos;
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }

  // Obtener detalle de un pedido específico
  async getPedidoById(idPedido, idCliente) {
    try {
      const where = { idPedido };
      if (idCliente) where.idCliente = idCliente;

      const pedido = await Pedido.findOne({
        where,
        include: [
          {
            model: DetallePedido,
            as: "detalles",
            include: [
              {
                model: Llanta,
                as: "llanta",
                attributes: [
                  "idLlanta",
                  "modelo",
                  "ancho",
                  "perfil",
                  "rin",
                  "precio",
                ],
                include: [
                  {
                    model: MarcaLlanta,
                    as: "marca",
                    attributes: ["idMarca", "nombre", "logoUrl"],
                  },
                ],
              },
            ],
          },
          {
            model: Direccion,
            as: "direccionEntrega",
            attributes: [
              "idDireccion",
              "provincia",
              "ciudad",
              "direccionCompleta",
              "referencia",
            ],
          },
          {
            model: Pago,
            as: "pagos",
            include: [
              {
                model: MetodoPago,
                as: "metodoPago",
                attributes: ["idMetodo", "nombre", "descripcion"],
              },
            ],
          },
        ],
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      return pedido;
    } catch (error) {
      throw new Error(`Error al obtener pedido: ${error.message}`);
    }
  }

  // Obtener tracking (estado actual del envío)
  async getTracking(idPedido, idCliente) {
    try {
      const pedido = await Pedido.findOne({
        where: { idPedido, idCliente },
        attributes: [
          "idPedido",
          "numeroPedido",
          "estado",
          "requiereInstalacion",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: Direccion,
            as: "direccionEntrega",
            attributes: ["provincia", "ciudad", "direccionCompleta"],
          },
        ],
      });

      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      // Construir el historial de estados según el estado actual
      const estadosOrden = [
        "PENDIENTE",
        "CONFIRMADO",
        "EN_PREPARACION",
        "ENVIADO",
        "ENTREGADO",
      ];
      const indiceActual = estadosOrden.indexOf(pedido.estado);

      const tracking = {
        numeroPedido: pedido.numeroPedido,
        estadoActual: pedido.estado,
        requiereInstalacion: pedido.requiereInstalacion,
        fechaPedido: pedido.createdAt,
        ultimaActualizacion: pedido.updatedAt,
        direccionEntrega: pedido.direccionEntrega,
        historial: estadosOrden.map((estado, index) => ({
          estado,
          completado: index <= indiceActual && pedido.estado !== "CANCELADO",
          activo: index === indiceActual && pedido.estado !== "CANCELADO",
        })),
        cancelado: pedido.estado === "CANCELADO",
      };

      return tracking;
    } catch (error) {
      throw new Error(`Error al obtener tracking: ${error.message}`);
    }
  }
}

module.exports = new PedidoService();
