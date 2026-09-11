const {
  Pedido,
  DetallePedido,
  Pago,
  Carrito,
  ItemCarrito,
  Producto,
  Direccion,
  MetodoPago,
} = require("../models");
const { sequelize } = require("../models");
const { includeProductoResumen } = require("../utils/productoHelpers");

const detalleInclude = [
  {
    model: Producto,
    as: "producto",
    attributes: ["idProducto", "nombre", "precio", "precioAnterior", "stock", "activo"],
    include: includeProductoResumen(),
  },
];

class PedidoService {
  _generarNumeroPedido() {
    const anio = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `P-${anio}-${random}`;
  }

  async checkout(idCliente, data) {
    const { idDireccionEntrega, idMetodoPago, requiereInstalacion, observaciones } = data;

    const t = await sequelize.transaction();

    try {
      const direccion = await Direccion.findOne({
        where: { idDireccion: idDireccionEntrega, idCliente },
        transaction: t,
      });
      if (!direccion) {
        throw new Error("La dirección de entrega no es válida");
      }

      const metodoPago = await MetodoPago.findByPk(idMetodoPago, {
        transaction: t,
      });
      if (!metodoPago) {
        throw new Error("El método de pago no es válido");
      }

      const carrito = await Carrito.findOne({
        where: { idCliente, estado: "ACTIVO" },
        include: [
          {
            model: ItemCarrito,
            as: "items",
            include: [
              {
                model: Producto,
                as: "producto",
                attributes: ["idProducto", "nombre", "precio", "stock", "activo"],
              },
            ],
          },
        ],
        transaction: t,
      });

      if (!carrito || !carrito.items || carrito.items.length === 0) {
        throw new Error("El carrito está vacío");
      }

      for (const item of carrito.items) {
        if (!item.producto.activo) {
          throw new Error(
            `El producto "${item.producto.nombre || item.idProducto}" ya no está disponible`
          );
        }
        if (item.producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto #${item.idProducto}. Disponible: ${item.producto.stock}`
          );
        }
      }

      const subtotal = carrito.items.reduce(
        (acc, item) => acc + parseFloat(item.precioUnitario) * item.cantidad,
        0
      );
      const iva = parseFloat((subtotal * 0.15).toFixed(2));
      const costoEnvio = 0;
      const total = parseFloat((subtotal + iva + costoEnvio).toFixed(2));

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

      for (const item of carrito.items) {
        await DetallePedido.create(
          {
            idPedido: pedido.idPedido,
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: (parseFloat(item.precioUnitario) * item.cantidad).toFixed(2),
          },
          { transaction: t }
        );

        await Producto.update(
          { stock: item.producto.stock - item.cantidad },
          { where: { idProducto: item.idProducto }, transaction: t }
        );
      }

      await Pago.create(
        {
          idPedido: pedido.idPedido,
          idMetodoPago,
          monto: total.toFixed(2),
          estadoPago: "PENDIENTE",
        },
        { transaction: t }
      );

      await carrito.update({ estado: "CONVERTIDO" }, { transaction: t });

      await t.commit();

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

  async getPedidos(idCliente) {
    try {
      const pedidos = await Pedido.findAll({
        where: { idCliente },
        include: [
          {
            model: DetallePedido,
            as: "detalles",
            include: detalleInclude,
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return pedidos;
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }

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
            include: detalleInclude,
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
