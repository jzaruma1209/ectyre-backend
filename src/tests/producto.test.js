const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { TipoProducto, Marca, Modelo, Ancho, Alto, Aro, EspecificacionTecnica, Producto } = require("../models");

// Arquitectura de productos: flujo A (con modelo y medidas) y flujo B (solo marca) + reglas de negocio
describe("Productos API Tests", () => {
  const sufijo = Date.now();
  const tokenAdmin = jwt.sign({ idCliente: 1, role: "admin" }, process.env.TOKEN_SECRET || "test_secret_key", {
    expiresIn: "1h",
  });
  const auth = { Authorization: `Bearer ${tokenAdmin}` };
  let llantas, baterias, marcaLlanta, otraMarca, marcaBateria, modelo, modeloOtraMarca, ancho, alto, aro, traccion, voltaje;
  let base;

  beforeAll(async () => {
    llantas = await TipoProducto.create({ codigo: `L${sufijo}`.slice(0, 10), nombre: `LLANTAS TEST ${sufijo}`, requiereModeloMedidas: true });
    baterias = await TipoProducto.create({ codigo: `B${sufijo}`.slice(0, 10), nombre: `BATERIAS TEST ${sufijo}`, requiereModeloMedidas: false });
    marcaLlanta = await Marca.create({ idTipoProducto: llantas.idTipoProducto, nombre: "Nankang", logoUrl: "https://x.test/l.png", bannerUrl: "https://x.test/b.png" });
    otraMarca = await Marca.create({ idTipoProducto: llantas.idTipoProducto, nombre: "Davanti", logoUrl: "https://x.test/l.png", bannerUrl: "https://x.test/b.png" });
    marcaBateria = await Marca.create({ idTipoProducto: baterias.idTipoProducto, nombre: "Bosch" });
    modelo = await Modelo.create({ idMarca: marcaLlanta.idMarca, nombre: "NS-2" });
    modeloOtraMarca = await Modelo.create({ idMarca: otraMarca.idMarca, nombre: "Terracota" });
    [ancho] = await Ancho.findOrCreate({ where: { valor: 225 } });
    [alto] = await Alto.findOrCreate({ where: { valor: 75 } });
    [aro] = await Aro.findOrCreate({ where: { valor: 15 } });
    traccion = await EspecificacionTecnica.create({ nombre: `Tracción ${sufijo}` });
    await traccion.setTiposProducto([llantas.idTipoProducto]);
    voltaje = await EspecificacionTecnica.create({ nombre: `Voltaje ${sufijo}` });
    await voltaje.setTiposProducto([baterias.idTipoProducto]);

    base = {
      idTipoProducto: llantas.idTipoProducto,
      idMarca: marcaLlanta.idMarca,
      idModelo: modelo.idModelo,
      idAncho: ancho.idAncho,
      idAlto: alto.idAlto,
      idAro: aro.idAro,
      nombre: "Nankang NS-2 225/75R15",
      precio: 99.9,
      precioAnterior: 120,
      enOferta: true,
      stock: 0,
      especificaciones: [{ idEspecificacion: traccion.idEspecificacion, valor: "A" }],
    };
  });

  afterAll(async () => {
    await Producto.destroy({ where: { idTipoProducto: [llantas.idTipoProducto, baterias.idTipoProducto] } });
    await Modelo.destroy({ where: { idModelo: [modelo.idModelo, modeloOtraMarca.idModelo] } });
    await Marca.destroy({ where: { idMarca: [marcaLlanta.idMarca, otraMarca.idMarca, marcaBateria.idMarca] } });
    await traccion.destroy();
    await voltaje.destroy();
    await llantas.destroy();
    await baterias.destroy();
  });

  const crear = (datos) => request(app).post("/api/v1/admin/productos").set(auth).send(datos);

  describe("POST /api/v1/admin/productos — reglas de negocio", () => {
    test("Requiere token de administrador", async () => {
      await request(app).post("/api/v1/admin/productos").send(base).expect(401);
    });

    test("Regla 1: modelo y medidas obligatorios si el tipo lo requiere", async () => {
      const res = await crear({ ...base, idModelo: null, idAncho: null, idAlto: null, idAro: null }).expect(400);
      expect(res.body.errors).toHaveLength(4);
    });

    test("Regla 2: el modelo debe pertenecer a la marca", async () => {
      const res = await crear({ ...base, idModelo: modeloOtraMarca.idModelo }).expect(400);
      expect(res.body.message).toMatch(/no pertenece a la marca/);
    });

    test("Regla 5: el precio anterior debe ser mayor al precio", async () => {
      await crear({ ...base, precioAnterior: 50 }).expect(400);
    });

    test("Regla 6: en oferta exige precio anterior", async () => {
      await crear({ ...base, precioAnterior: null }).expect(400);
    });

    test("Regla 7: solo especificaciones del tipo de producto", async () => {
      const res = await crear({ ...base, especificaciones: [{ idEspecificacion: voltaje.idEspecificacion, valor: "12V" }] }).expect(400);
      expect(res.body.message).toMatch(/no aplica/);
    });

    test("Regla 8: la marca debe existir", async () => {
      await crear({ ...base, idMarca: 999999 }).expect(400);
    });

    test("Regla 9: el precio debe ser mayor a 0", async () => {
      await crear({ ...base, precio: 0, precioAnterior: null, enOferta: false }).expect(400);
    });

    test("Regla 10: stock 0 se guarda como no disponible (flujo A)", async () => {
      const res = await crear(base).expect(201);
      expect(res.body.data.disponible).toBe(false);
      expect(res.body.data.medidas.texto).toBe("225/75R15");
      expect(res.body.data.descuentoPorcentaje).toBe(17);
    });

    test("Flujo B: producto simple sin modelo ni medidas", async () => {
      const res = await crear({
        idTipoProducto: baterias.idTipoProducto,
        idMarca: marcaBateria.idMarca,
        nombre: "Batería Bosch S4",
        precio: 89.9,
        stock: 5,
        especificaciones: [{ idEspecificacion: voltaje.idEspecificacion, valor: "12V" }],
      }).expect(201);
      expect(res.body.data.modelo).toBeNull();
      expect(res.body.data.medidas).toBeNull();
      expect(res.body.data.disponible).toBe(true);
    });
  });

  describe("Catálogo público", () => {
    test("GET /api/v1/productos devuelve el contrato del card", async () => {
      const res = await request(app).get("/api/v1/productos").expect(200);
      expect(res.body.success).toBe(true);
      const producto = res.body.data.find((p) => p.marca?.idMarca === marcaLlanta.idMarca);
      expect(producto).toHaveProperty("especificaciones");
      expect(producto).toHaveProperty("imagenes");
      expect(producto.modelo.nombre).toBe("NS-2");
    });

    test("GET /api/v1/productos/buscar-general detecta medidas", async () => {
      const res = await request(app).get("/api/v1/productos/buscar-general").query({ q: "225/75R15" }).expect(200);
      expect(res.body.data.tipo).toBe("medida");
    });

    test("GET /api/v1/productos/:id inexistente → 404", async () => {
      await request(app).get("/api/v1/productos/999999").expect(404);
    });
  });
});
