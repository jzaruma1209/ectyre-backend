const request = require("supertest");
const app = require("../app");
const { Carrito, Cliente, ItemCarrito } = require("../models");
const testMigrate = require("./testMigrate");
const { crearProductoDePrueba } = require("./helpers/fixturesProducto");

describe("Carrito API Tests", () => {
  let testCliente;
  let testProducto;
  let limpiarProducto;

  beforeAll(async () => {
    await testMigrate();

    testCliente = await Cliente.create({
      tipoIdentificacion: "CEDULA",
      numeroIdentificacion: "1234567890",
      nombres: "Juan",
      apellidos: "Pérez",
      email: "juan.perez@test.com",
      telefono: "0999999999",
      passwordHash: "password123",
      activo: true,
    });

    const fixture = await crearProductoDePrueba({ nombre: "Michelin Pilot Sport 4", precio: 150, stock: 10 });
    testProducto = fixture.producto;
    limpiarProducto = fixture.limpiar;
  });

  afterAll(async () => {
    await ItemCarrito.destroy({ where: {} });
    await Carrito.destroy({ where: {} });
    await limpiarProducto();
    await Cliente.destroy({ where: {} });
  });

  describe("POST /api/v1/carrito/agregar", () => {
    test("Debe agregar un item al carrito para un cliente autenticado", async () => {
      const response = await request(app)
        .post("/api/v1/carrito/agregar")
        .send({
          idCliente: testCliente.idCliente,
          idProducto: testProducto.idProducto,
          cantidad: 4,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("carrito");
    });

    test("Debe validar que la cantidad sea mayor a 0", async () => {
      await request(app)
        .post("/api/v1/carrito/agregar")
        .send({
          idCliente: testCliente.idCliente,
          idProducto: testProducto.idProducto,
          cantidad: 0,
        })
        .expect(400);
    });

    test("Debe validar que el producto exista", async () => {
      await request(app)
        .post("/api/v1/carrito/agregar")
        .send({
          idCliente: testCliente.idCliente,
          idProducto: 99999,
          cantidad: 4,
        })
        .expect(404);
    });
  });

  describe("GET /api/v1/carrito", () => {
    test("Debe obtener el carrito del cliente autenticado", async () => {
      const response = await request(app)
        .get("/api/v1/carrito")
        .query({ sesionId: "test-session" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("carrito");
    });
  });
});
