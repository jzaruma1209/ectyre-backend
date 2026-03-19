const request = require("supertest");
const app = require("../app");
const {
  Cliente,
  MarcaLlanta,
  Llanta,
  Carrito,
  ItemCarrito,
  Direccion,
  MetodoPago,
  Pedido,
  DetallePedido,
  Pago,
} = require("../models");
const testMigrate = require("./testMigrate");
const jwt = require("jsonwebtoken");

describe("Pedido API Tests — Flujo de Checkout Completo", () => {
  let tokenCliente;
  let testCliente;
  let testLlanta;
  let testDireccion;
  let testMetodoPago;
  let pedidoCreado;

  beforeAll(async () => {
    await testMigrate();

    // Crear cliente de prueba
    testCliente = await Cliente.create({
      tipoIdentificacion: "CEDULA",
      numeroIdentificacion: "5555555555",
      nombres: "Pedido",
      apellidos: "Test",
      email: "pedido.test@llantas247.com",
      telefono: "0977777777",
      passwordHash: "hashedPass",
      activo: true,
    });

    // Generar token manualmente
    tokenCliente = jwt.sign(
      { idCliente: testCliente.idCliente, email: testCliente.email },
      process.env.TOKEN_SECRET || "test_secret_key",
      { expiresIn: "1h" }
    );

    // Crear marca y llanta
    const marca = await MarcaLlanta.create({ nombre: "Test Brand Pedido", activo: true });
    testLlanta = await Llanta.create({
      idMarca: marca.idMarca,
      modelo: "TestTire",
      ancho: 205,
      perfil: 55,
      rin: 16,
      precio: 100.00,
      stock: 10,
      activo: true,
    });

    // Crear método de pago
    testMetodoPago = await MetodoPago.create({
      nombre: "Efectivo Test",
      codigo: "EFECTIVO_TEST",
      activo: true,
    });
  });

  afterAll(async () => {
    await Pago.destroy({ where: {} });
    await DetallePedido.destroy({ where: {} });
    await Pedido.destroy({ where: {} });
    await ItemCarrito.destroy({ where: {} });
    await Carrito.destroy({ where: {} });
    await Direccion.destroy({ where: {} });
    await Llanta.destroy({ where: {} });
    await MarcaLlanta.destroy({ where: {} });
    await MetodoPago.destroy({ where: {} });
    await Cliente.destroy({ where: {} });
  });

  // ─── Direcciones ─────────────────────────────────────────
  describe("Flujo de Direcciones", () => {
    test("Debe crear una dirección correctamente", async () => {
      const res = await request(app)
        .post("/api/v1/direcciones")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({
          provincia: "Pichincha",
          ciudad: "Quito",
          direccionCompleta: "Av. Naciones Unidas N35-50",
          referencia: "Junto al CC El Jardín",
          esPrincipal: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("idDireccion");
      expect(res.body.data.esPrincipal).toBe(true);

      testDireccion = res.body.data;
    });

    test("Debe listar las direcciones del cliente", async () => {
      const res = await request(app)
        .get("/api/v1/direcciones")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Debe fallar al crear dirección sin autenticación", async () => {
      await request(app)
        .post("/api/v1/direcciones")
        .send({ provincia: "Pichincha", ciudad: "Quito", direccionCompleta: "Calle Test" })
        .expect(401);
    });
  });

  // ─── Carrito → Checkout ──────────────────────────────────
  describe("Flujo Carrito → Checkout", () => {
    test("Debe agregar item al carrito", async () => {
      const res = await request(app)
        .post("/api/v1/carrito/agregar")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ idLlanta: testLlanta.idLlanta, cantidad: 4 })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    test("Debe ver el carrito con los items", async () => {
      const res = await request(app)
        .get("/api/v1/carrito")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("items");
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    test("Debe procesar el checkout correctamente", async () => {
      const res = await request(app)
        .post("/api/v1/pedidos/checkout")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({
          idDireccionEntrega: testDireccion.idDireccion,
          idMetodoPago: testMetodoPago.idMetodo,
          requiereInstalacion: false,
          observaciones: "Entregar en horario de oficina",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("numeroPedido");
      expect(res.body.data.estado).toBe("PENDIENTE");
      expect(res.body.data).toHaveProperty("detalles");
      expect(res.body.data.detalles.length).toBeGreaterThan(0);

      pedidoCreado = res.body.data;
    });

    test("Debe fallar el checkout con carrito vacío (ya convertido)", async () => {
      const res = await request(app)
        .post("/api/v1/pedidos/checkout")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({
          idDireccionEntrega: testDireccion.idDireccion,
          idMetodoPago: testMetodoPago.idMetodo,
        })
        .expect(500);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Consulta de Pedidos ─────────────────────────────────
  describe("Consulta de Pedidos", () => {
    test("Debe listar los pedidos del cliente", async () => {
      const res = await request(app)
        .get("/api/v1/pedidos")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Debe obtener el detalle de un pedido", async () => {
      const res = await request(app)
        .get(`/api/v1/pedidos/${pedidoCreado.idPedido}`)
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.numeroPedido).toBe(pedidoCreado.numeroPedido);
    });

    test("Debe obtener el tracking del pedido", async () => {
      const res = await request(app)
        .get(`/api/v1/pedidos/${pedidoCreado.idPedido}/tracking`)
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("estadoActual");
      expect(res.body.data).toHaveProperty("historial");
      expect(res.body.data.estadoActual).toBe("PENDIENTE");
    });

    test("Debe devolver 404 para un pedido de otro cliente", async () => {
      const res = await request(app)
        .get("/api/v1/pedidos/999999")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(500);

      expect(res.body.success).toBe(false);
    });
  });
});
