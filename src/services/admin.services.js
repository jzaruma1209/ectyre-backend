const {
  Pedido,
  DetallePedido,
  Cliente,
  Llanta,
  MarcaLlanta,
  ImagenLlanta,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

class AdminService {
  // ─────────────────────────────────────────────
  // DASHBOARD — métricas generales
  // ─────────────────────────────────────────────
  async getDashboard() {
    try {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);

      // Ventas totales (pedidos no cancelados)
      const ventasTotales = await Pedido.sum("total", {
        where: { estado: { [Op.ne]: "CANCELADO" } },
      });

      // Ventas del mes actual
      const ventasMes = await Pedido.sum("total", {
        where: {
          estado: { [Op.ne]: "CANCELADO" },
          createdAt: { [Op.gte]: inicioMes },
        },
      });

      // Ventas del mes anterior (para comparativa)
      const ventasMesAnterior = await Pedido.sum("total", {
        where: {
          estado: { [Op.ne]: "CANCELADO" },
          createdAt: { [Op.between]: [inicioMesAnterior, inicioMes] },
        },
      });

      // Total de pedidos por estado
      const pedidosPorEstado = await Pedido.findAll({
        attributes: [
          "estado",
          [sequelize.fn("COUNT", sequelize.col("id_pedido")), "total"],
        ],
        group: ["estado"],
        raw: true,
      });

      // Pedidos recientes (últimos 10)
      const pedidosRecientes = await Pedido.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        attributes: [
          "idPedido",
          "numeroPedido",
          "total",
          "estado",
          "createdAt",
        ],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["idCliente", "nombres", "apellidos", "email"],
          },
        ],
      });

      // Productos más vendidos (top 5)
      const productosMasVendidos = await DetallePedido.findAll({
        attributes: [
          "idLlanta",
          [sequelize.fn("SUM", sequelize.col("cantidad")), "unidadesVendidas"],
          [sequelize.fn("SUM", sequelize.col("DetallePedido.subtotal")), "totalGenerado"],
        ],
        include: [
          {
            model: Llanta,
            as: "llanta",
            attributes: ["idLlanta", "modelo", "ancho", "perfil", "rin", "precio", "stock"],
            include: [
              {
                model: MarcaLlanta,
                as: "marca",
                attributes: ["idMarca", "nombre"],
              },
              {
                model: ImagenLlanta,
                as: "imagenes",
                where: { tipoImagen: "PRINCIPAL" },
                required: false,
                attributes: ["urlImagen"],
                limit: 1,
              },
            ],
          },
          {
            model: Pedido,
            as: "pedido",
            where: { estado: { [Op.ne]: "CANCELADO" } },
            attributes: [],
          },
        ],
        group: ["idLlanta", "llanta.id_llanta", "llanta->marca.id_marca", "llanta->imagenes.id_imagen"],
        order: [[sequelize.fn("SUM", sequelize.col("cantidad")), "DESC"]],
        limit: 5,
        subQuery: false,
      });

      // Clientes nuevos este mes
      const clientesNuevosMes = await Cliente.count({
        where: {
          createdAt: { [Op.gte]: inicioMes },
          activo: true,
        },
      });

      // Total clientes activos
      const totalClientes = await Cliente.count({ where: { activo: true } });

      // Stock bajo (menos de 5 unidades)
      const stockBajo = await Llanta.findAll({
        where: { stock: { [Op.lt]: 5 }, activo: true },
        attributes: ["idLlanta", "modelo", "ancho", "perfil", "rin", "stock"],
        include: [
          {
            model: MarcaLlanta,
            as: "marca",
            attributes: ["idMarca", "nombre"],
          },
        ],
        order: [["stock", "ASC"]],
        limit: 10,
      });

      return {
        ventas: {
          total: ventasTotales || 0,
          mes: ventasMes || 0,
          mesAnterior: ventasMesAnterior || 0,
          crecimiento: ventasMesAnterior
            ? (((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100).toFixed(1)
            : null,
        },
        pedidos: {
          porEstado: pedidosPorEstado,
          recientes: pedidosRecientes,
        },
        clientes: {
          total: totalClientes,
          nuevosEsteMes: clientesNuevosMes,
        },
        productosMasVendidos,
        stockBajo,
      };
    } catch (error) {
      throw new Error(`Error al obtener dashboard: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // CLIENTES — gestión desde Admin
  // ─────────────────────────────────────────────
  async getAllClientes({ page = 1, limit = 20, search = "" } = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = { activo: true };

      if (search) {
        where[Op.or] = [
          { nombres: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { numeroIdentificacion: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Cliente.findAndCountAll({
        where,
        attributes: { exclude: ["passwordHash"] },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
        clientes: rows,
      };
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  async getClienteById(idCliente) {
    try {
      const cliente = await Cliente.findByPk(idCliente, {
        attributes: { exclude: ["passwordHash"] },
        include: [
          {
            model: Pedido,
            as: "pedidos",
            attributes: ["idPedido", "numeroPedido", "total", "estado", "createdAt"],
            order: [["createdAt", "DESC"]],
            limit: 5,
          },
        ],
      });

      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }
      return cliente;
    } catch (error) {
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }
  }

  async toggleClienteActivo(idCliente) {
    try {
      const cliente = await Cliente.findByPk(idCliente);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }
      await cliente.update({ activo: !cliente.activo });
      return {
        idCliente: cliente.idCliente,
        activo: cliente.activo,
        message: `Cliente ${cliente.activo ? "activado" : "desactivado"} correctamente`,
      };
    } catch (error) {
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // PEDIDOS — actualizar estado desde Admin
  // ─────────────────────────────────────────────
  async updateEstadoPedido(idPedido, estado) {
    try {
      const estadosValidos = [
        "PENDIENTE",
        "CONFIRMADO",
        "EN_PREPARACION",
        "ENVIADO",
        "ENTREGADO",
        "CANCELADO",
      ];
      if (!estadosValidos.includes(estado)) {
        throw new Error(`Estado inválido. Estados válidos: ${estadosValidos.join(", ")}`);
      }

      const pedido = await Pedido.findByPk(idPedido);
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      // No se puede reabrir un pedido ya entregado o cancelado
      if (["ENTREGADO", "CANCELADO"].includes(pedido.estado)) {
        throw new Error(`No se puede modificar un pedido en estado ${pedido.estado}`);
      }

      await pedido.update({ estado });

      const pedidoActualizado = await Pedido.findByPk(idPedido, {
        attributes: ["idPedido", "numeroPedido", "estado", "total", "updatedAt"],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["idCliente", "nombres", "apellidos", "email"],
          },
        ],
      });

      return pedidoActualizado;
    } catch (error) {
      throw new Error(`Error al actualizar estado del pedido: ${error.message}`);
    }
  }

  // Listar todos los pedidos con paginación (admin ve todos)
  async getAllPedidos({ page = 1, limit = 20, estado = null } = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};
      if (estado) where.estado = estado;

      const { count, rows } = await Pedido.findAndCountAll({
        where,
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["idCliente", "nombres", "apellidos", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        total: count,
        pagina: page,
        totalPaginas: Math.ceil(count / limit),
        pedidos: rows,
      };
    } catch (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`);
    }
  }
}

module.exports = new AdminService();
