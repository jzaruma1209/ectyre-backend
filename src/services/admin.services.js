const {
  Pedido,
  DetallePedido,
  Cliente,
  Producto,
  Marca,
  Carrito,
  Direccion,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { includeProductoResumen, includeMedidas } = require("../utils/productoHelpers");
const { formatearMedida } = require("../utils/formatoMedida");

const detalleInclude = [
  {
    model: Producto,
    as: "producto",
    attributes: ["idProducto", "nombre", "precio", "precioAnterior", "stock", "activo"],
    include: includeProductoResumen(),
  },
];

// SQL compartido por los reportes de productos más vendidos
const SQL_PRODUCTOS_VENDIDOS = (filtroPedidos, limite) => `
  SELECT
    dp.id_producto                    AS "idProducto",
    SUM(dp.cantidad)                  AS "unidadesVendidas",
    SUM(dp.subtotal)                  AS "totalGenerado",
    COUNT(dp.id_pedido)               AS "vecesComprado",
    prod.nombre                       AS "productoNombre",
    prod.precio                       AS "productoPrecio",
    prod.stock                        AS "productoStock",
    m.id_marca                        AS "marcaIdMarca",
    m.nombre                          AS "marcaNombre",
    a.valor                           AS "ancho",
    al.valor                          AS "alto",
    r.valor                           AS "aro",
    MIN(img.url_imagen)               AS "imagenPrincipal"
  FROM detalle_pedido dp
  INNER JOIN pedidos p ON p.id_pedido = dp.id_pedido AND p.estado <> 'CANCELADO' ${filtroPedidos}
  INNER JOIN productos prod ON prod.id_producto = dp.id_producto
  INNER JOIN marcas m ON m.id_marca = prod.id_marca
  LEFT JOIN producto_medidas pm ON pm.id_producto = prod.id_producto
  LEFT JOIN anchos a ON a.id_ancho = pm.id_ancho
  LEFT JOIN altos al ON al.id_alto = pm.id_alto
  LEFT JOIN aros r ON r.id_aro = pm.id_aro
  LEFT JOIN imagenes_productos img
         ON img.id_producto = prod.id_producto AND img.tipo_imagen = 'PRINCIPAL'
  GROUP BY dp.id_producto, prod.nombre, prod.precio, prod.stock, m.id_marca, m.nombre, a.valor, al.valor, r.valor
  ORDER BY SUM(dp.cantidad) DESC
  LIMIT ${limite}`;

const mapearProductoVendido = (row) => ({
  idProducto: row.idProducto,
  unidadesVendidas: Number(row.unidadesVendidas) || 0,
  totalGenerado: Number(row.totalGenerado) || 0,
  vecesComprado: Number(row.vecesComprado) || 0,
  producto: {
    idProducto: row.idProducto,
    nombre: row.productoNombre,
    precio: row.productoPrecio,
    stock: row.productoStock,
    marca: { idMarca: row.marcaIdMarca, nombre: row.marcaNombre },
    medida: formatearMedida(row.ancho, row.alto, row.aro),
    imagenes: row.imagenPrincipal ? [{ urlImagen: row.imagenPrincipal }] : [],
  },
});

class AdminService {
  async getDashboard() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);

    const safe = async (label, fn, fallback) => {
      try {
        return await fn();
      } catch (err) {
        const pgErr = err.original || err;
        console.error(`[getDashboard][${label}] ERROR:`, {
          message: err.message,
          pgMessage: pgErr.message,
          pgCode: pgErr.code,
          pgDetail: pgErr.detail,
          sql: err.sql || null,
        });
        return fallback;
      }
    };

    const [ventasTotales, ventasMes, ventasMesAnterior] = await Promise.all([
      safe("ventasTotales", () =>
        Pedido.sum("total", { where: { estado: { [Op.ne]: "CANCELADO" } } }), 0),
      safe("ventasMes", () =>
        Pedido.sum("total", {
          where: {
            estado: { [Op.ne]: "CANCELADO" },
            createdAt: { [Op.gte]: inicioMes },
          },
        }), 0),
      safe("ventasMesAnterior", () =>
        Pedido.sum("total", {
          where: {
            estado: { [Op.ne]: "CANCELADO" },
            createdAt: { [Op.between]: [inicioMesAnterior, inicioMes] },
          },
        }), 0),
    ]);

    const pedidosPorEstado = await safe("pedidosPorEstado", () =>
      Pedido.findAll({
        attributes: [
          "estado",
          [sequelize.fn("COUNT", sequelize.col("id_pedido")), "total"],
        ],
        group: ["estado"],
        raw: true,
      }), []);

    const pedidosRecientes = await safe("pedidosRecientes", () =>
      Pedido.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        attributes: ["idPedido", "numeroPedido", "total", "estado", "createdAt"],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["idCliente", "nombres", "apellidos", "email"],
          },
        ],
      }), []);

    const productosMasVendidos = await safe("productosMasVendidos", async () => {
      const filas = await sequelize.query(SQL_PRODUCTOS_VENDIDOS("", 5), {
        type: sequelize.QueryTypes.SELECT,
      });
      return filas.map(mapearProductoVendido);
    }, []);

    const [clientesNuevosMes, totalClientes] = await Promise.all([
      safe("clientesNuevosMes", () =>
        Cliente.count({ where: { createdAt: { [Op.gte]: inicioMes }, activo: true } }), 0),
      safe("totalClientes", () =>
        Cliente.count({ where: { activo: true } }), 0),
    ]);

    const stockBajo = await safe("stockBajo", () =>
      Producto.findAll({
        where: { stock: { [Op.lt]: 5 }, activo: true },
        attributes: ["idProducto", "nombre", "precio", "stock"],
        include: [{ model: Marca, as: "marca", attributes: ["idMarca", "nombre"] }, includeMedidas()],
        order: [["stock", "ASC"]],
        limit: 10,
      }), []);

    return {
      ventas: {
        total: ventasTotales || 0,
        mes: ventasMes || 0,
        mesAnterior: ventasMesAnterior || 0,
        crecimiento:
          ventasMesAnterior && ventasMesAnterior !== 0
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
            attributes: ["idDireccion", "provincia", "ciudad", "direccionCompleta", "referencia"],
          },
          {
            model: DetallePedido,
            as: "detalles",
            include: detalleInclude,
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
                model: Producto,
                as: "producto",
                attributes: ["idProducto", "nombre", "precio"],
                include: [{ model: Marca, as: "marca", attributes: ["nombre"] }, includeMedidas()],
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
  // INVENTARIO — actualizar stock
  // ─────────────────────────────────────────────
  async updateStockLlanta(idProducto, stock) {
    try {
      // Regla 10: stock 0 es válido (el producto se muestra como "Agotado")
      if (stock === undefined || stock === null || stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
        throw new Error("El stock debe ser un número entero mayor o igual a 0");
      }

      const producto = await Producto.findByPk(idProducto, {
        include: [{ model: Marca, as: "marca", attributes: ["nombre"] }],
      });
      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      await producto.update({ stock: parseInt(stock) });

      return producto;
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

      const totalVentas = await Pedido.sum("total", { where }) || 0;
      const totalPedidos = await Pedido.count({ where });

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
      let fechaDesde, fechaHasta;

      try {
        fechaDesde = desde ? new Date(desde) : new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        fechaHasta = hasta ? new Date(hasta) : ahora;

        if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
          throw new Error("Fechas inválidas");
        }
      } catch (dateErr) {
        console.error("[getProductosTop] Error parsing fechas:", dateErr.message);
        fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        fechaHasta = ahora;
      }

      const parsedLimit = parseInt(limit) || 10;

      const productosRaw = await sequelize.query(
        SQL_PRODUCTOS_VENDIDOS("AND p.created_at BETWEEN :desde AND :hasta", ":limit"),
        {
          replacements: { desde: fechaDesde, hasta: fechaHasta, limit: parsedLimit },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!productosRaw || !Array.isArray(productosRaw)) {
        console.warn("[getProductosTop] Query no devolvió array, retornando vacío");
        return {
          periodo: { desde: fechaDesde, hasta: fechaHasta },
          productos: [],
        };
      }

      const productos = productosRaw.map(mapearProductoVendido);

      return {
        periodo: { desde: fechaDesde, hasta: fechaHasta },
        productos,
      };
    } catch (error) {
      console.error("[getProductosTop] ERROR:", error);
      throw new Error(`Error al obtener productos top: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // REPORTES — estadísticas de carritos
  // ─────────────────────────────────────────────
  async getStatsCarritos() {
    try {
      const porEstado = await Carrito.findAll({
        attributes: [
          "estado",
          [sequelize.fn("COUNT", sequelize.col("id_carrito")), "total"],
        ],
        group: ["estado"],
        raw: true,
      });

      const activos = await Carrito.count({ where: { estado: "ACTIVO" } });
      const abandonados = await Carrito.count({ where: { estado: "ABANDONADO" } });
      const convertidos = await Carrito.count({ where: { estado: "CONVERTIDO" } });

      const totalNoVacíos = activos + abandonados + convertidos;
      const tasaConversion = totalNoVacíos > 0
        ? ((convertidos / totalNoVacíos) * 100).toFixed(1)
        : 0;

      const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const abandonadosRecientes = await Carrito.count({
        where: {
          estado: "ABANDONADO",
          fechaAbandonado: { [Op.gte]: hace24h },
        },
      });

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
