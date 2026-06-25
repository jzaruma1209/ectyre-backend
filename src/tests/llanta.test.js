const request = require("supertest");
const app = require("../app");
const { Llanta, MarcaLlanta, Producto, ImagenProducto } = require("../models");
const testMigrate = require("./testMigrate");

describe("Llanta API Tests", () => {
  let testMarca;
  let testLlanta;

  beforeAll(async () => {
    await testMigrate();

    testMarca = await MarcaLlanta.create({
      nombre: "Michelin Test",
      descripcion: "Marca de prueba",
      activo: true,
    });

    testLlanta = await Llanta.create({
      idMarca: testMarca.idMarca,
      ancho: 225,
      perfil: 45,
      rin: 17,
    });

    await Producto.create({
      nombre: "Llanta Michelin Pilot Sport 4S",
      precio: 189.99,
      stock: 20,
      activo: true,
      idLlanta: testLlanta.idLlanta,
    });

    // Segunda llanta para probar filtros
    const testLlanta2 = await Llanta.create({
      idMarca: testMarca.idMarca,
      ancho: 205,
      perfil: 55,
      rin: 16,
    });

    await Producto.create({
      nombre: "Llanta Michelin Energy Saver",
      precio: 145.00,
      stock: 0,
      activo: true,
      idLlanta: testLlanta2.idLlanta,
    });
  });

  afterAll(async () => {
    await ImagenProducto.destroy({ where: {} });
    await Producto.destroy({ where: {} });
    await Llanta.destroy({ where: {} });
    await MarcaLlanta.destroy({ where: {} });
  });

  // ─── Listado ─────────────────────────────────────────────
  describe("GET /api/v1/llantas", () => {
    test("Debe listar todas las llantas activas", async () => {
      const res = await request(app)
        .get("/api/v1/llantas")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("Debe filtrar llantas destacadas", async () => {
      const res = await request(app)
        .get("/api/v1/llantas?destacado=true")
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.forEach((l) => expect(l.producto.destacado).toBe(true));
    });

    test("Debe filtrar por marca", async () => {
      const res = await request(app)
        .get(`/api/v1/llantas?idMarca=${testMarca.idMarca}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ─── Detalle ─────────────────────────────────────────────
  describe("GET /api/v1/llantas/:id", () => {
    test("Debe obtener llanta por ID con sus relaciones", async () => {
      const res = await request(app)
        .get(`/api/v1/llantas/${testLlanta.idLlanta}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.idLlanta).toBe(testLlanta.idLlanta);
      expect(res.body.data.producto.nombre).toBe("Llanta Michelin Pilot Sport 4S");
      expect(res.body.data).toHaveProperty("marca");
    });

    test("Debe devolver 404 si la llanta no existe", async () => {
      const res = await request(app)
        .get("/api/v1/llantas/999999")
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    test("Debe devolver 400 si el ID no es numérico", async () => {
      const res = await request(app)
        .get("/api/v1/llantas/abc")
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Búsqueda por medida ──────────────────────────────────
  describe("GET /api/v1/llantas/buscar-medida", () => {
    test("Debe buscar llantas por medida correcta", async () => {
      const res = await request(app)
        .get("/api/v1/llantas/buscar-medida?ancho=225&perfil=45&rin=17")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("Debe fallar si faltan parámetros de medida", async () => {
      const res = await request(app)
        .get("/api/v1/llantas/buscar-medida?ancho=225")
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    test("Debe retornar array vacío si no hay coincidencias", async () => {
      const res = await request(app)
        .get("/api/v1/llantas/buscar-medida?ancho=100&perfil=10&rin=5")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
