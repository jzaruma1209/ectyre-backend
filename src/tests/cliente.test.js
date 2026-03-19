const request = require("supertest");
const app = require("../app");
const { Cliente, Direccion } = require("../models");
const testMigrate = require("./testMigrate");

describe("Cliente API Tests", () => {
  let tokenCliente;
  let testCliente;
  const clienteData = {
    tipoIdentificacion: "CEDULA",
    numeroIdentificacion: "9876543210",
    nombres: "Test",
    apellidos: "Usuario",
    email: "test.cliente@ectyre.com",
    telefono: "0981234567",
    password: "Test1234!",
  };

  beforeAll(async () => {
    await testMigrate();
  });

  afterAll(async () => {
    await Direccion.destroy({ where: {} });
    await Cliente.destroy({ where: {} });
  });

  // ─── Registro ───────────────────────────────────────────
  describe("POST /api/v1/clientes/registro", () => {
    test("Debe registrar un cliente correctamente", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/registro")
        .send(clienteData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("idCliente");
      expect(res.body.data.email).toBe(clienteData.email);
      expect(res.body.data).not.toHaveProperty("passwordHash");

      testCliente = res.body.data;
    });

    test("Debe fallar si el email ya existe", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/registro")
        .send(clienteData)
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    test("Debe fallar si faltan campos requeridos", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/registro")
        .send({ email: "incompleto@test.com" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty("errors");
    });

    test("Debe fallar con email inválido", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/registro")
        .send({ ...clienteData, email: "no-es-un-email", numeroIdentificacion: "1111111111" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Login ──────────────────────────────────────────────
  describe("POST /api/v1/clientes/login", () => {
    test("Debe hacer login correctamente y devolver token", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/login")
        .send({ email: clienteData.email, password: clienteData.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("cliente");
      expect(res.body.data.cliente).not.toHaveProperty("passwordHash");

      tokenCliente = res.body.data.token;
    });

    test("Debe fallar con contraseña incorrecta", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/login")
        .send({ email: clienteData.email, password: "ContraseñaWrong123" })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test("Debe fallar con email inexistente", async () => {
      const res = await request(app)
        .post("/api/v1/clientes/login")
        .send({ email: "noexiste@test.com", password: "Test1234!" })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Perfil ─────────────────────────────────────────────
  describe("GET /api/v1/clientes/perfil", () => {
    test("Debe obtener el perfil del cliente autenticado", async () => {
      const res = await request(app)
        .get("/api/v1/clientes/perfil")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(clienteData.email);
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    test("Debe fallar sin token", async () => {
      const res = await request(app)
        .get("/api/v1/clientes/perfil")
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test("Debe fallar con token inválido", async () => {
      const res = await request(app)
        .get("/api/v1/clientes/perfil")
        .set("Authorization", "Bearer token_invalido_123")
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Actualizar Perfil ───────────────────────────────────
  describe("PUT /api/v1/clientes/perfil", () => {
    test("Debe actualizar el teléfono del cliente", async () => {
      const res = await request(app)
        .put("/api/v1/clientes/perfil")
        .set("Authorization", `Bearer ${tokenCliente}`)
        .send({ telefono: "0999888777" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.telefono).toBe("0999888777");
    });
  });
});
