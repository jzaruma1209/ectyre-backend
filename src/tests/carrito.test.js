const request = require("supertest");
const app = require("../app");
const { Carrito, Cliente, ItemCarrito, Llanta } = require("../models");
const testMigrate = require("./testMigrate");

describe("Carrito API Tests", () => {
  let testCliente;
  let testLlanta;

  beforeAll(async () => {
    // Reset database antes de todos los tests
    await testMigrate();

    // Crear cliente de prueba
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

    // Crear llanta de prueba (necesitamos una marca primero)
    const { MarcaLlanta } = require("../models");
    const testMarca = await MarcaLlanta.create({
      nombre: "Michelin Test",
      descripcion: "Marca de prueba",
      activo: true,
    });

    testLlanta = await Llanta.create({
      idMarca: testMarca.idMarca,
      modelo: "Pilot Sport 4",
      ancho: 225,
      perfil: 45,
      rin: 17,
      precioVenta: 150.0,
      stock: 10,
      activo: true,
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await ItemCarrito.destroy({ where: {} });
    await Carrito.destroy({ where: {} });
    await Llanta.destroy({ where: {} });
    await Cliente.destroy({ where: {} });
  });

  describe("POST /api/carrito", () => {
    test("Debe crear un carrito para un cliente autenticado", async () => {
      const response = await request(app)
        .post("/api/carrito")
        .send({
          idCliente: testCliente.idCliente,
        })
        .expect(201);

      expect(response.body).toHaveProperty("idCarrito");
      expect(response.body.idCliente).toBe(testCliente.idCliente);
      expect(response.body.estado).toBe("ACTIVO");
    });

    test("Debe crear un carrito para un invitado (sin cliente)", async () => {
      const response = await request(app)
        .post("/api/carrito")
        .send({
          sesionId: "session-12345",
        })
        .expect(201);

      expect(response.body).toHaveProperty("idCarrito");
      expect(response.body.sesionId).toBe("session-12345");
      expect(response.body.idCliente).toBeNull();
      expect(response.body.estado).toBe("ACTIVO");
    });
  });

  describe("GET /api/carrito/:id", () => {
    let testCarrito;

    beforeEach(async () => {
      testCarrito = await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });
    });

    test("Debe obtener un carrito por ID", async () => {
      const response = await request(app)
        .get(`/api/carrito/${testCarrito.idCarrito}`)
        .expect(200);

      expect(response.body.idCarrito).toBe(testCarrito.idCarrito);
      expect(response.body.estado).toBe("ACTIVO");
    });

    test("Debe devolver 404 si el carrito no existe", async () => {
      await request(app).get("/api/carrito/99999").expect(404);
    });
  });

  describe("POST /api/carrito/:id/items", () => {
    let testCarrito;

    beforeEach(async () => {
      testCarrito = await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });
    });

    test("Debe agregar un item al carrito", async () => {
      const response = await request(app)
        .post(`/api/carrito/${testCarrito.idCarrito}/items`)
        .send({
          idLlanta: testLlanta.idLlanta,
          cantidad: 4,
        })
        .expect(201);

      expect(response.body).toHaveProperty("idItem");
      expect(response.body.idCarrito).toBe(testCarrito.idCarrito);
      expect(response.body.idLlanta).toBe(testLlanta.idLlanta);
      expect(response.body.cantidad).toBe(4);
      expect(response.body.precioUnitario).toBe("150.00");
    });

    test("Debe validar que la cantidad sea mayor a 0", async () => {
      await request(app)
        .post(`/api/carrito/${testCarrito.idCarrito}/items`)
        .send({
          idLlanta: testLlanta.idLlanta,
          cantidad: 0,
        })
        .expect(400);
    });

    test("Debe validar que la llanta exista", async () => {
      await request(app)
        .post(`/api/carrito/${testCarrito.idCarrito}/items`)
        .send({
          idLlanta: 99999,
          cantidad: 4,
        })
        .expect(404);
    });
  });

  describe("PUT /api/carrito/:id/items/:itemId", () => {
    let testCarrito;
    let testItem;

    beforeEach(async () => {
      testCarrito = await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });

      testItem = await ItemCarrito.create({
        idCarrito: testCarrito.idCarrito,
        idLlanta: testLlanta.idLlanta,
        cantidad: 4,
        precioUnitario: 150.0,
      });
    });

    test("Debe actualizar la cantidad de un item", async () => {
      const response = await request(app)
        .put(`/api/carrito/${testCarrito.idCarrito}/items/${testItem.idItem}`)
        .send({
          cantidad: 6,
        })
        .expect(200);

      expect(response.body.cantidad).toBe(6);
    });

    test("Debe validar que la cantidad sea mayor a 0", async () => {
      await request(app)
        .put(`/api/carrito/${testCarrito.idCarrito}/items/${testItem.idItem}`)
        .send({
          cantidad: -1,
        })
        .expect(400);
    });
  });

  describe("DELETE /api/carrito/:id/items/:itemId", () => {
    let testCarrito;
    let testItem;

    beforeEach(async () => {
      testCarrito = await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });

      testItem = await ItemCarrito.create({
        idCarrito: testCarrito.idCarrito,
        idLlanta: testLlanta.idLlanta,
        cantidad: 4,
        precioUnitario: 150.0,
      });
    });

    test("Debe eliminar un item del carrito", async () => {
      await request(app)
        .delete(
          `/api/carrito/${testCarrito.idCarrito}/items/${testItem.idItem}`
        )
        .expect(204);

      const item = await ItemCarrito.findByPk(testItem.idItem);
      expect(item).toBeNull();
    });

    test("Debe devolver 404 si el item no existe", async () => {
      await request(app)
        .delete(`/api/carrito/${testCarrito.idCarrito}/items/99999`)
        .expect(404);
    });
  });

  describe("DELETE /api/carrito/:id", () => {
    let testCarrito;

    beforeEach(async () => {
      testCarrito = await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });
    });

    test("Debe eliminar un carrito", async () => {
      await request(app)
        .delete(`/api/carrito/${testCarrito.idCarrito}`)
        .expect(204);

      const carrito = await Carrito.findByPk(testCarrito.idCarrito);
      expect(carrito).toBeNull();
    });

    test("Debe devolver 404 si el carrito no existe", async () => {
      await request(app).delete("/api/carrito/99999").expect(404);
    });
  });

  describe("GET /api/carrito/cliente/:idCliente", () => {
    beforeEach(async () => {
      // Crear varios carritos para el cliente
      await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ACTIVO",
      });

      await Carrito.create({
        idCliente: testCliente.idCliente,
        estado: "ABANDONADO",
      });
    });

    test("Debe obtener todos los carritos de un cliente", async () => {
      const response = await request(app)
        .get(`/api/carrito/cliente/${testCliente.idCliente}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty("idCarrito");
      expect(response.body[0].idCliente).toBe(testCliente.idCliente);
    });

    test("Debe devolver array vacío si el cliente no tiene carritos", async () => {
      const response = await request(app)
        .get("/api/carrito/cliente/99999")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
