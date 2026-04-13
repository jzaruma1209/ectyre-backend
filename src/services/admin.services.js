const {
  Pedido,
  DetallePedido,
  Cliente,
  Llanta,
  MarcaLlanta,
  ImagenLlanta,
  Carrito,
  ItemCarrito,
  Direccion,
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

      // Productos más vendidos (top 5) — Raw SQL para evitar el bug de GROUP BY
      // con paths Sequelize ("llanta->marca.id_marca") que PostgreSQL rechaza.
      const [productosMasVendidosRaw] = await sequelize.query(`
        SELECT
          dp.id_llanta                          AS "idLlanta",
          SUM(dp.cantidad)                      AS "unidadesVendidas",
          SUM(dp.subtotal)                      AS "totalGenerado",
          l.id_llanta                           AS "llanta.idLlanta",
          l.modelo                              AS "llanta.modelo",
          l.ancho                               AS "llanta.ancho",
          l.perfil                              AS "llanta.perfil",
          l.rin                                 AS "llanta.rin",
          l.precio                              AS "llanta.precio",
          l.stock                               AS "llanta.stock",
          m.id_marca                            AS "llanta.marca.idMarca",
          m.nombre                              AS "llanta.marca.nombre",
          MIN(img.url_imagen)                   AS "llanta.imagenPrincipal"
        FROM detalle_pedidos dp
        INNER JOIN pedidos p   ON p.id_pedido  = dp.id_pedido  AND p.estado <> 'CANCELADO'
        INNER JOIN llantas  l  ON l.id_llanta  = dp.id_llanta
        INNER JOIN marcas_llantas m ON m.id_marca = l.id_marca
        LEFT  JOIN imagenes_llantas img
               ON img.id_llanta = l.id_llanta AND img.tipo_imagen = 'PRINCIPAL'
        GROUP BY dp.id_llanta, l.id_llanta, m.id_marca
        ORDER BY SUM(dp.cantidad) DESC
        LIMIT 5
      `);

      // Normalizar para mantener la misma forma que esperaba el frontend
      const productosMasVendidos = productosMasVendidosRaw.map((row) => ({
        idLlanta: row.idLlanta,
        unidadesVendidas: Number(row.unidadesVendidas),
        totalGenerado: Number(row.totalGenerado),
        llanta: {
          idLlanta: row["llanta.idLlanta"],
          modelo: row["llanta.modelo"],
          ancho: row["llanta.ancho"],
          perfil: row["llanta.perfil"],
          rin: row["llanta.rin"],
          precio: row["llanta.precio"],
          stock: row["llanta.stock"],
          marca: {
            idMarca: row["llanta.marca.idMarca"],
            nombre: row["llanta.marca.nombre"],
          },
          imagenes: row["llanta.imagenPrincipal"]
            ? [{ urlImagen: row["llanta.imagenPrincipal"] }]
            : [],
        },
      }));

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
      // Exponer el error original de Sequelize/PostgreSQL para diagnóstico en producción
      const pgError = error.original || error;
      console.error("[getDashboard] Error:", {
        message: error.message,
        pgMessage: pgError.message,
        pgCode: pgError.code,
        pgDetail: pgError.detail,
        sql: error.sql || null,
        stack: error.stack,
      });
      const detailedMessage = pgError.message || error.message;
      throw new Error(`Error al obtener dashboard: ${detailedMessage}`);
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

  // ─────────────────────────────────────────────
  // PEDIDOS — detalle individual (admin)
  // ─────────────────────────────────────────────
  async getPedidoById(idPedido) {
    try {
      const pedido = await Pedido.findByPk(idPedido, {
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["idCliente", "nombres", "apellidos", "email", "telefono"],
          },
          {
            model: Direccion,
            as: "direccionEntrega",
            attributes: ["calle", "numeracion", "ciudad", "provincia", "referencias"],
          },
          {
            model: DetallePedido,
            as: "detalles",
            include: [
              {
                model: Llanta,
                as: "llanta",
                attributes: ["idLlanta", "modelo", "ancho", "perfil", "rin", "precio"],
                include: [
                  {
                    model: MarcaLlanta,
                    as: "marca",
                    attributes: ["nombre"],
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

  // ─────────────────────────────────────────────
  // CLIENTES — pedidos de un cliente (admin)
  // ─────────────────────────────────────────────
  async getPedidosByCliente(idCliente, { page = 1, limit = 10 } = {}) {
    try {
      const cliente = await Cliente.findByPk(idCliente, {
        attributes: ["idCliente"],
      });
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      const offset = (page - 1) * limit;
      const { count, rows } = await Pedido.findAndCountAll({
        where: { idCliente },
        include: [
          {
            model: DetallePedido,
            as: "detalles",
            attributes: ["cantidad", "precioUnitario", "subtotal"],
            include: [
              {
                model: Llanta,
                as: "llanta",
                attributes: ["modelo", "ancho", "perfil", "rin"],
                include: [
                  { model: MarcaLlanta, as: "marca", attributes: ["nombre"] },
                ],
              },
            ],
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
      throw new Error(`Error al obtener pedidos del cliente: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // INVENTARIO — actualizar stock de una llanta
  // ─────────────────────────────────────────────
  async updateStockLlanta(idLlanta, stock) {
    try {
      if (stock === undefined || stock === null || isNaN(stock) || stock < 0) {
        throw new Error("El stock debe ser un número mayor o igual a 0");
      }

      const llanta = await Llanta.findByPk(idLlanta);
      if (!llanta) {
        throw new Error("Llanta no encontrada");
      }

      await llanta.update({ stock: parseInt(stock) });

      const actualizada = await Llanta.findByPk(idLlanta, {
        attributes: ["idLlanta", "modelo", "ancho", "perfil", "rin", "stock", "activo"],
        include: [{ model: MarcaLlanta, as: "marca", attributes: ["nombre"] }],
      });
      return actualizada;
    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // REPORTES — ventas por período
  // ─────────────────────────────────────────────
  async getReporteVentas({ desde, hasta } = {}) {
    try {
      const ahora = new Date();
      const fechaDesde = desde ? new Date(desde) : new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const fechaHasta = hasta ? new Date(hasta) : ahora;

      const where = {
        estado: { [Op.ne]: "CANCELADO" },
        createdAt: { [Op.between]: [fechaDesde, fechaHasta] },
      };

      // Total de ventas en el período
      const totalVentas = await Pedido.sum("total", { where }) || 0;
      const totalPedidos = await Pedido.count({ where });

      // Ventas agrupadas por día
      const ventasPorDia = await Pedido.findAll({
        where,
        attributes: [
          [sequelize.fn("DATE", sequelize.col("created_at")), "fecha"],
          [sequelize.fn("COUNT", sequelize.col("id_pedido")), "numeroPedidos"],
          [sequelize.fn("SUM", sequelize.col("total")), "totalVentas"],
        ],
        group: [sequelize.fn("DATE", sequelize.col("created_at"))],
        order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
        raw: true,
      });

      // Ventas por estado
      const ventasPorEstado = await Pedido.findAll({
        where: { createdAt: { [Op.between]: [fechaDesde, fechaHasta] } },
        attributes: [
          "estado",
          [sequelize.fn("COUNT", sequelize.col("id_pedido")), "total"],
          [sequelize.fn("SUM", sequelize.col("total")), "monto"],
        ],
        group: ["estado"],
        raw: true,
      });

      return {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        resumen: {
          totalVentas,
          totalPedidos,
          ticketPromedio: totalPedidos > 0 ? (totalVentas / totalPedidos).toFixed(2) : 0,
        },
        ventasPorDia,
        ventasPorEstado,
      };
    } catch (error) {
      throw new Error(`Error al obtener reporte de ventas: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // REPORTES — productos más vendidos
  // ─────────────────────────────────────────────
  async getProductosTop({ limit = 10, desde, hasta } = {}) {
    try {
      const ahora = new Date();
      const fechaDesde = desde ? new Date(desde) : new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const fechaHasta = hasta ? new Date(hasta) : ahora;

      // Raw SQL para evitar el bug de GROUP BY con paths Sequelize en PostgreSQL
      const [productosRaw] = await sequelize.query(
        `
        SELECT
          dp.id_llanta                  AS "idLlanta",
          SUM(dp.cantidad)              AS "unidadesVendidas",
          SUM(dp.subtotal)              AS "totalGenerado",
          COUNT(dp.id_pedido)           AS "vecesComprado",
          l.id_llanta                   AS "llanta.idLlanta",
          l.modelo                      AS "llanta.modelo",
          l.ancho                       AS "llanta.ancho",
          l.perfil                      AS "llanta.perfil",
          l.rin                         AS "llanta.rin",
          l.precio                      AS "llanta.precio",
          l.stock                       AS "llanta.stock",
          m.nombre                      AS "llanta.marca.nombre",
          MIN(img.url_imagen)           AS "llanta.imagenPrincipal"
        FROM detalle_pedidos dp
        INNER JOIN pedidos p  ON p.id_pedido = dp.id_pedido
                              AND p.estado <> 'CANCELADO'
                              AND p.created_at BETWEEN :desde AND :hasta
        INNER JOIN llantas l  ON l.id_llanta = dp.id_llanta
        INNER JOIN marcas_llantas m ON m.id_marca = l.id_marca
        LEFT  JOIN imagenes_llantas img
               ON img.id_llanta = l.id_llanta AND img.tipo_imagen = 'PRINCIPAL'
        GROUP BY dp.id_llanta, l.id_llanta, m.id_marca
        ORDER BY SUM(dp.cantidad) DESC
        LIMIT :limit
        `,
        {
          replacements: { desde: fechaDesde, hasta: fechaHasta, limit: parseInt(limit) },
          type: sequelize.QueryTypes ? undefined : "RAW",
        }
      );

      const productos = productosRaw.map((row) => ({
        idLlanta: row.idLlanta,
        unidadesVendidas: Number(row.unidadesVendidas),
        totalGenerado: Number(row.totalGenerado),
        vecesComprado: Number(row.vecesComprado),
        llanta: {
          idLlanta: row["llanta.idLlanta"],
          modelo: row["llanta.modelo"],
          ancho: row["llanta.ancho"],
          perfil: row["llanta.perfil"],
          rin: row["llanta.rin"],
          precio: row["llanta.precio"],
          stock: row["llanta.stock"],
          marca: { nombre: row["llanta.marca.nombre"] },
          imagenes: row["llanta.imagenPrincipal"]
            ? [{ urlImagen: row["llanta.imagenPrincipal"] }]
            : [],
        },
      }));

      return {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        productos,
      };
    } catch (error) {
      throw new Error(`Error al obtener productos top: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // REPORTES — estadísticas de carritos
  // ─────────────────────────────────────────────
  async getStatsCarritos() {
    try {
      // Conteo por estado
      const porEstado = await Carrito.findAll({
        attributes: [
          "estado",
          [sequelize.fn("COUNT", sequelize.col("id_carrito")), "total"],
        ],
        group: ["estado"],
        raw: true,
      });

      // Carritos activos (con items)
      const activos = await Carrito.count({ where: { estado: "ACTIVO" } });
      const abandonados = await Carrito.count({ where: { estado: "ABANDONADO" } });
      const convertidos = await Carrito.count({ where: { estado: "CONVERTIDO" } });

      // Tasa de conversión
      const totalNoVacíos = activos + abandonados + convertidos;
      const tasaConversion = totalNoVacíos > 0
        ? ((convertidos / totalNoVacíos) * 100).toFixed(1)
        : 0;

      // Carritos abandonados en las últimas 24h
      const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const abandonadosRecientes = await Carrito.count({
        where: {
          estado: "ABANDONADO",
          fechaAbandonado: { [Op.gte]: hace24h },
        },
      });

      // Carritos de clientes registrados vs invitados
      const conCliente = await Carrito.count({
        where: { idCliente: { [Op.ne]: null } },
      });
      const sinCliente = await Carrito.count({
        where: { idCliente: null },
      });

      return {
        resumen: {
          activos,
          abandonados,
          convertidos,
          tasaConversion: `${tasaConversion}%`,
        },
        abandonadosUltimas24h: abandonadosRecientes,
        porTipoUsuario: {
          registrados: conCliente,
          invitados: sinCliente,
        },
        porEstado,
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de carritos: ${error.message}`);
    }
  }
}

module.exports = new AdminService();
