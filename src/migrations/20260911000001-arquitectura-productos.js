"use strict";

/**
 * Arquitectura del sistema de productos (ver ECTYRE-ARQUITECTURA-PRODUCTOS.md / DB_DOCUMENTATION.md)
 *
 *  - familias           → tipos_producto   (+ bandera requiere_modelo_medidas)
 *  - tipos_llanta       → tipos_uso        (tipo de uso del modelo: AT, MT, HP…)
 *  - marcas_llantas     → marcas           (pertenece a un tipo de producto, logo + banner)
 *  - modelos_llantas    → modelos          (pertenece a una marca, tipo de uso opcional)
 *  - NUEVAS: anchos, altos, aros, especificaciones_tecnicas, especificaciones_tipos_producto,
 *            producto_medidas, producto_especificaciones
 *  - productos: referencia directa a tipo/marca/modelo, precio_anterior y flags del card
 *  - compatibilidad: id_llanta → id_producto
 *  - Se eliminan: llantas, imagenes_llantas, indices_carga, indices_velocidad, temperaturas,
 *    sentidos_rotacion, lineas, procedencias y la tabla genérica `marcas` (fusionada).
 *
 * Todo corre en una sola transacción: si algo falla no queda ningún cambio a medias.
 * Si existen productos creados con el esquema anterior (productos → llantas) se migran.
 */

const nombreNormalizado = (columna) => `translate(upper(${columna}), 'ÁÉÍÓÚÜ', 'AEIOUU')`;

const TIPOS_PRODUCTO_BASE = [
  { nombre: "LLANTAS", descripcion: "Llantas para vehículos", requiere: true },
  { nombre: "AROS", descripcion: "Aros y rines", requiere: false },
  { nombre: "ACEITES", descripcion: "Aceites lubricantes", requiere: false },
  { nombre: "ACCESORIOS", descripcion: "Accesorios varios", requiere: false },
  { nombre: "BATERÍAS", descripcion: "Baterías para vehículos", requiere: false },
  { nombre: "TUBOS", descripcion: "Tubos (neumáticos interiores)", requiere: false },
];

const MEDIDAS_BASE = {
  anchos: [145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325],
  altos: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
  aros: [12, 13, 14, 15, 16, 17, 17.5, 18, 19, 19.5, 20, 21, 22, 22.5, 24, 24.5],
};

const ESPECIFICACIONES_BASE = [
  { nombre: "Tracción", tipos: ["LLANTAS"] },
  { nombre: "Temperatura", tipos: ["LLANTAS"] },
  { nombre: "Desgaste (Treadwear)", tipos: ["LLANTAS"] },
  { nombre: "Índice de carga", tipos: ["LLANTAS"] },
  { nombre: "Índice de velocidad", tipos: ["LLANTAS"] },
  { nombre: "Voltaje", tipos: ["BATERIAS"] },
  { nombre: "Amperaje", tipos: ["BATERIAS"] },
];

const crearHelpers = (queryInterface, transaction) => {
  const run = (sql, replacements) =>
    queryInterface.sequelize.query(sql, { transaction, replacements });
  const rows = async (sql, replacements) => (await run(sql, replacements))[0];
  const existeTabla = async (tabla) =>
    Boolean((await rows(`SELECT to_regclass(:nombre) AS reg`, { nombre: `public.${tabla}` }))[0].reg);
  const existeColumna = async (tabla, columna) =>
    (
      await rows(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = :tabla AND column_name = :columna`,
        { tabla, columna }
      )
    ).length > 0;
  const existeRestriccion = async (tabla, nombre) =>
    (
      await rows(
        `SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
         WHERE t.relname = :tabla AND c.conname = :nombre`,
        { tabla, nombre }
      )
    ).length > 0;
  const renombrarRelacion = async (tipo, antes, despues) => {
    if ((await existeTabla(antes)) && !(await existeTabla(despues))) {
      await run(`ALTER ${tipo} "${antes}" RENAME TO "${despues}"`);
    }
  };
  const renombrarRestriccion = async (tabla, antes, despues) => {
    if ((await existeRestriccion(tabla, antes)) && !(await existeRestriccion(tabla, despues))) {
      await run(`ALTER TABLE "${tabla}" RENAME CONSTRAINT "${antes}" TO "${despues}"`);
    }
  };
  const agregarColumna = async (tabla, columna, definicion) => {
    if (!(await existeColumna(tabla, columna))) {
      await run(`ALTER TABLE "${tabla}" ADD COLUMN "${columna}" ${definicion}`);
    }
  };
  const eliminarColumna = async (tabla, columna) => {
    if (await existeColumna(tabla, columna)) {
      await run(`ALTER TABLE "${tabla}" DROP COLUMN "${columna}"`);
    }
  };
  const agregarRestriccion = async (tabla, nombre, definicion) => {
    if (!(await existeRestriccion(tabla, nombre))) {
      await run(`ALTER TABLE "${tabla}" ADD CONSTRAINT "${nombre}" ${definicion}`);
    }
  };
  return {
    run,
    rows,
    existeTabla,
    existeColumna,
    existeRestriccion,
    renombrarRelacion,
    renombrarRestriccion,
    agregarColumna,
    eliminarColumna,
    agregarRestriccion,
  };
};

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const h = crearHelpers(queryInterface, transaction);
    const { run, rows } = h;

    try {
      // ─── 1. Tipos de producto (antes: familias) ─────────────────────────────
      await h.renombrarRelacion("TABLE", "familias", "tipos_producto");
      await h.renombrarRelacion("SEQUENCE", "familias_id_seq", "tipos_producto_id_tipo_producto_seq");
      if (!(await h.existeTabla("tipos_producto"))) {
        await run(`
          CREATE TABLE tipos_producto (
            id_tipo_producto SERIAL PRIMARY KEY,
            codigo VARCHAR(10) NOT NULL UNIQUE,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            activo BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          )`);
      }
      if (await h.existeColumna("tipos_producto", "id")) {
        await run(`ALTER TABLE tipos_producto RENAME COLUMN id TO id_tipo_producto`);
      }
      await h.renombrarRestriccion("tipos_producto", "familias_pkey", "tipos_producto_pkey");
      await h.renombrarRestriccion("tipos_producto", "familias_codigo_key", "tipos_producto_codigo_key");
      await h.renombrarRelacion("INDEX", "familias_codigo", "tipos_producto_codigo");
      await h.renombrarRelacion("INDEX", "familias_activo", "tipos_producto_activo");
      await h.agregarColumna("tipos_producto", "requiere_modelo_medidas", "BOOLEAN NOT NULL DEFAULT false");

      for (const tipo of TIPOS_PRODUCTO_BASE) {
        const existentes = await rows(
          `SELECT id_tipo_producto FROM tipos_producto
           WHERE ${nombreNormalizado("nombre")} = ${nombreNormalizado(":nombre")}`,
          { nombre: tipo.nombre }
        );
        if (existentes.length > 0) continue;
        const codigos = (await rows(`SELECT codigo FROM tipos_producto`)).map((r) => r.codigo);
        let siguiente = codigos.reduce((max, c) => Math.max(max, parseInt(c, 10) || 0), 0) + 1;
        while (codigos.includes(String(siguiente).padStart(3, "0"))) siguiente += 1;
        await run(
          `INSERT INTO tipos_producto (codigo, nombre, descripcion, requiere_modelo_medidas, activo, created_at, updated_at)
           VALUES (:codigo, :nombre, :descripcion, :requiere, true, now(), now())`,
          {
            codigo: String(siguiente).padStart(3, "0"),
            nombre: tipo.nombre,
            descripcion: tipo.descripcion,
            requiere: tipo.requiere,
          }
        );
      }
      await run(
        `UPDATE tipos_producto SET requiere_modelo_medidas = true
         WHERE ${nombreNormalizado("nombre")} = 'LLANTAS'`
      );
      const [{ id_tipo_producto: idLlantas }] = await rows(
        `SELECT id_tipo_producto FROM tipos_producto WHERE ${nombreNormalizado("nombre")} = 'LLANTAS' LIMIT 1`
      );

      // ─── 2. Tipos de uso (antes: tipos_llanta) ──────────────────────────────
      await h.renombrarRelacion("TABLE", "tipos_llanta", "tipos_uso");
      await h.renombrarRelacion("SEQUENCE", "tipos_llanta_id_tipo_llanta_seq", "tipos_uso_id_tipo_uso_seq");
      if (!(await h.existeTabla("tipos_uso"))) {
        await run(`
          CREATE TABLE tipos_uso (
            id_tipo_uso SERIAL PRIMARY KEY,
            codigo VARCHAR(5) NOT NULL UNIQUE,
            descripcion VARCHAR(150) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`);
      }
      if (await h.existeColumna("tipos_uso", "id_tipo_llanta")) {
        await run(`ALTER TABLE tipos_uso RENAME COLUMN id_tipo_llanta TO id_tipo_uso`);
      }
      await h.renombrarRestriccion("tipos_uso", "tipos_llanta_pkey", "tipos_uso_pkey");
      await h.renombrarRestriccion("tipos_uso", "tipos_llanta_codigo_key", "tipos_uso_codigo_key");

      // ─── 3. Marcas: marcas_llantas pasa a ser la tabla canónica ─────────────
      const hayMarcasGenericas =
        (await h.existeTabla("marcas")) && (await h.existeColumna("marcas", "codigo"));
      await h.agregarColumna("marcas_llantas", "id_tipo_producto", "INTEGER");
      await h.agregarColumna("marcas_llantas", "banner_url", "VARCHAR(500)");
      await run(`UPDATE marcas_llantas SET id_tipo_producto = :idLlantas WHERE id_tipo_producto IS NULL`, {
        idLlantas,
      });

      // ─── 4. Productos: nuevas columnas (nullable hasta migrar datos) ────────
      if ((await h.existeColumna("productos", "familia_id")) && !(await h.existeColumna("productos", "id_tipo_producto"))) {
        await run(`ALTER TABLE productos RENAME COLUMN familia_id TO id_tipo_producto`);
      }
      await h.agregarColumna("productos", "id_tipo_producto", "INTEGER");
      await h.agregarColumna("productos", "id_marca", "INTEGER");
      await h.agregarColumna("productos", "id_modelo", "INTEGER");
      await h.agregarColumna("productos", "precio_anterior", "DECIMAL(10,2)");
      await h.agregarColumna("productos", "es_nuevo", "BOOLEAN NOT NULL DEFAULT false");
      await h.agregarColumna("productos", "en_oferta", "BOOLEAN NOT NULL DEFAULT false");
      await h.agregarColumna("productos", "envio_gratis", "BOOLEAN NOT NULL DEFAULT false");
      await h.agregarColumna("productos", "aplica_devoluciones", "BOOLEAN NOT NULL DEFAULT false");
      await h.agregarColumna("productos", "aplica_garantia", "BOOLEAN NOT NULL DEFAULT false");

      // ─── 5. Fusionar la tabla genérica `marcas` dentro de marcas_llantas ────
      if (hayMarcasGenericas) {
        const tieneImagen = await h.existeColumna("marcas", "imagen_url");
        const genericas = await rows(
          `SELECT id, nombre, pais, ${tieneImagen ? "imagen_url" : "NULL AS imagen_url"}, activo
           FROM marcas ORDER BY id`
        );
        const productosTienenMarcaGenerica = await h.existeColumna("productos", "marca_id");
        for (const generica of genericas) {
          const coincidencias = await rows(
            `SELECT id_marca FROM marcas_llantas
             WHERE regexp_replace(upper(nombre), '[^A-Z0-9]', '', 'g') = regexp_replace(upper(:nombre), '[^A-Z0-9]', '', 'g')
             ORDER BY id_marca LIMIT 1`,
            { nombre: generica.nombre }
          );
          let idMarca = coincidencias[0]?.id_marca;
          if (!idMarca) {
            const [creada] = await rows(
              `INSERT INTO marcas_llantas (nombre, pais_origen, logo_url, activo, id_tipo_producto, created_at, updated_at)
               VALUES (:nombre, :pais, :logo, :activo, :tipo, now(), now())
               RETURNING id_marca`,
              {
                nombre: generica.nombre,
                pais: generica.pais || null,
                logo: generica.imagen_url || null,
                activo: generica.activo !== false,
                tipo: idLlantas,
              }
            );
            idMarca = creada.id_marca;
          }
          if (productosTienenMarcaGenerica) {
            await run(`UPDATE productos SET id_marca = :idMarca WHERE marca_id = :idGenerica AND id_marca IS NULL`, {
              idMarca,
              idGenerica: generica.id,
            });
          }
        }
      }

      // ─── 6. Catálogos planos de medidas ─────────────────────────────────────
      for (const [tabla, pk] of [
        ["anchos", "id_ancho"],
        ["altos", "id_alto"],
        ["aros", "id_aro"],
      ]) {
        if (!(await h.existeTabla(tabla))) {
          await run(`
            CREATE TABLE ${tabla} (
              ${pk} SERIAL PRIMARY KEY,
              valor DECIMAL(6,2) NOT NULL,
              activo BOOLEAN NOT NULL DEFAULT true,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              CONSTRAINT ${tabla}_valor_key UNIQUE (valor),
              CONSTRAINT ${tabla}_valor_positivo CHECK (valor > 0)
            )`);
        }
        const valores = MEDIDAS_BASE[tabla].map(Number).join(",");
        await run(`INSERT INTO ${tabla} (valor) SELECT unnest(ARRAY[${valores}]) ON CONFLICT (valor) DO NOTHING`);
      }

      // ─── 7. Especificaciones técnicas + relación con tipos de producto ─────
      if (!(await h.existeTabla("especificaciones_tecnicas"))) {
        await run(`
          CREATE TABLE especificaciones_tecnicas (
            id_especificacion SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            icono_url VARCHAR(500),
            activo BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT especificaciones_tecnicas_nombre_key UNIQUE (nombre)
          )`);
      }
      if (!(await h.existeTabla("especificaciones_tipos_producto"))) {
        await run(`
          CREATE TABLE especificaciones_tipos_producto (
            id_especificacion INTEGER NOT NULL
              REFERENCES especificaciones_tecnicas (id_especificacion) ON UPDATE CASCADE ON DELETE CASCADE,
            id_tipo_producto INTEGER NOT NULL
              REFERENCES tipos_producto (id_tipo_producto) ON UPDATE CASCADE ON DELETE CASCADE,
            PRIMARY KEY (id_especificacion, id_tipo_producto)
          )`);
        await run(
          `CREATE INDEX especificaciones_tipos_producto_tipo ON especificaciones_tipos_producto (id_tipo_producto)`
        );
      }
      for (const especificacion of ESPECIFICACIONES_BASE) {
        let existente = (
          await rows(`SELECT id_especificacion FROM especificaciones_tecnicas WHERE lower(nombre) = lower(:nombre)`, {
            nombre: especificacion.nombre,
          })
        )[0];
        if (!existente) {
          existente = (
            await rows(
              `INSERT INTO especificaciones_tecnicas (nombre) VALUES (:nombre) RETURNING id_especificacion`,
              { nombre: especificacion.nombre }
            )
          )[0];
        }
        for (const tipo of especificacion.tipos) {
          await run(
            `INSERT INTO especificaciones_tipos_producto (id_especificacion, id_tipo_producto)
             SELECT :idEspecificacion, id_tipo_producto FROM tipos_producto
             WHERE ${nombreNormalizado("nombre")} = :tipo
             ON CONFLICT DO NOTHING`,
            { idEspecificacion: existente.id_especificacion, tipo }
          );
        }
      }

      // ─── 8. Relaciones del producto: medidas y especificaciones ────────────
      if (!(await h.existeTabla("producto_medidas"))) {
        await run(`
          CREATE TABLE producto_medidas (
            id_producto_medida SERIAL PRIMARY KEY,
            id_producto INTEGER NOT NULL REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE CASCADE,
            id_ancho INTEGER NOT NULL REFERENCES anchos (id_ancho) ON UPDATE CASCADE ON DELETE RESTRICT,
            id_alto INTEGER NOT NULL REFERENCES altos (id_alto) ON UPDATE CASCADE ON DELETE RESTRICT,
            id_aro INTEGER NOT NULL REFERENCES aros (id_aro) ON UPDATE CASCADE ON DELETE RESTRICT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT producto_medidas_id_producto_key UNIQUE (id_producto)
          )`);
        await run(`CREATE INDEX producto_medidas_id_ancho ON producto_medidas (id_ancho)`);
        await run(`CREATE INDEX producto_medidas_id_alto ON producto_medidas (id_alto)`);
        await run(`CREATE INDEX producto_medidas_id_aro ON producto_medidas (id_aro)`);
      }
      if (!(await h.existeTabla("producto_especificaciones"))) {
        await run(`
          CREATE TABLE producto_especificaciones (
            id_producto_especificacion SERIAL PRIMARY KEY,
            id_producto INTEGER NOT NULL REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE CASCADE,
            id_especificacion INTEGER NOT NULL
              REFERENCES especificaciones_tecnicas (id_especificacion) ON UPDATE CASCADE ON DELETE RESTRICT,
            valor VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT producto_especificaciones_unica UNIQUE (id_producto, id_especificacion)
          )`);
        await run(
          `CREATE INDEX producto_especificaciones_id_especificacion ON producto_especificaciones (id_especificacion)`
        );
      }

      // ─── 9. Migrar productos existentes que dependían de `llantas` ─────────
      const productosConLlanta =
        (await h.existeTabla("llantas")) && (await h.existeColumna("productos", "id_llanta"));
      if (productosConLlanta) {
        const conModelo = await h.existeColumna("llantas", "id_modelo_llanta");
        await run(
          `UPDATE productos p
           SET id_marca = COALESCE(p.id_marca, l.id_marca),
               ${conModelo ? "id_modelo = COALESCE(p.id_modelo, l.id_modelo_llanta)," : ""}
               id_tipo_producto = :idLlantas
           FROM llantas l
           WHERE p.id_llanta = l.id_llanta`,
          { idLlantas }
        );

        for (const [tabla, columna] of [
          ["anchos", "ancho"],
          ["altos", "perfil"],
          ["aros", "rin"],
        ]) {
          await run(
            `INSERT INTO ${tabla} (valor)
             SELECT DISTINCT l.${columna} FROM llantas l JOIN productos p ON p.id_llanta = l.id_llanta
             WHERE l.${columna} IS NOT NULL AND l.${columna} > 0
             ON CONFLICT (valor) DO NOTHING`
          );
        }
        await run(`
          INSERT INTO producto_medidas (id_producto, id_ancho, id_alto, id_aro)
          SELECT p.id_producto, a.id_ancho, al.id_alto, r.id_aro
          FROM productos p
          JOIN llantas l ON l.id_llanta = p.id_llanta
          JOIN anchos a ON a.valor = l.ancho
          JOIN altos al ON al.valor = l.perfil
          JOIN aros r ON r.valor = l.rin
          ON CONFLICT (id_producto) DO NOTHING`);

        const copiarEspecificacion = async (nombre, expresionValor, joinExtra = "") => {
          const encontrada = (
            await rows(`SELECT id_especificacion FROM especificaciones_tecnicas WHERE nombre = :nombre`, { nombre })
          )[0];
          if (!encontrada) return;
          await run(
            `INSERT INTO producto_especificaciones (id_producto, id_especificacion, valor)
             SELECT p.id_producto, :idEspecificacion, ${expresionValor}
             FROM productos p JOIN llantas l ON l.id_llanta = p.id_llanta ${joinExtra}
             WHERE ${expresionValor} IS NOT NULL
             ON CONFLICT (id_producto, id_especificacion) DO NOTHING`,
            { idEspecificacion: encontrada.id_especificacion }
          );
        };
        if ((await h.existeTabla("temperaturas")) && (await h.existeColumna("llantas", "id_temperatura"))) {
          await copiarEspecificacion("Temperatura", "t.codigo", "JOIN temperaturas t ON t.id_temperatura = l.id_temperatura");
        }
        if ((await h.existeTabla("indices_carga")) && (await h.existeColumna("llantas", "id_indice_carga"))) {
          await copiarEspecificacion(
            "Índice de carga",
            "ic.codigo",
            "JOIN indices_carga ic ON ic.id_indice_carga = l.id_indice_carga"
          );
        }
        if ((await h.existeTabla("indices_velocidad")) && (await h.existeColumna("llantas", "id_indice_velocidad"))) {
          await copiarEspecificacion(
            "Índice de velocidad",
            "iv.codigo",
            "JOIN indices_velocidad iv ON iv.id_indice_velocidad = l.id_indice_velocidad"
          );
        }
        if (await h.existeColumna("llantas", "treadwear")) {
          await copiarEspecificacion("Desgaste (Treadwear)", "CAST(l.treadwear AS VARCHAR)");
        }
      }

      // Compatibilidad vehicular: ahora apunta al producto
      if (await h.existeColumna("compatibilidad", "id_llanta")) {
        await h.agregarColumna("compatibilidad", "id_producto", "INTEGER");
        if (productosConLlanta) {
          await run(`
            UPDATE compatibilidad c SET id_producto = p.id_producto
            FROM productos p
            WHERE p.id_llanta = c.id_llanta AND c.id_producto IS NULL`);
        }
        // Filas de llantas que nunca tuvieron producto (no son vendibles)
        await run(`DELETE FROM compatibilidad WHERE id_producto IS NULL`);
        // Al quitar la columna, Postgres elimina también sus índices/constraints
        await run(`ALTER TABLE compatibilidad DROP COLUMN id_llanta`);
      }
      await h.agregarColumna("compatibilidad", "id_producto", "INTEGER");
      await run(`ALTER TABLE compatibilidad ALTER COLUMN id_producto SET NOT NULL`);
      await h.agregarRestriccion(
        "compatibilidad",
        "compatibilidad_id_producto_fkey",
        "FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON UPDATE CASCADE ON DELETE CASCADE"
      );
      await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_compatibilidad ON compatibilidad (id_producto, id_modelo, anio_desde)`
      );
      await run(`CREATE INDEX IF NOT EXISTS compatibilidad_id_producto ON compatibilidad (id_producto)`);

      // ─── 10. Precios: `precio` = lo que paga el cliente, `precio_anterior` = precio tachado ─
      if (await h.existeColumna("productos", "precio_oferta")) {
        await run(`
          UPDATE productos
          SET precio_anterior = precio, precio = precio_oferta, en_oferta = true
          WHERE precio_oferta IS NOT NULL AND precio_oferta > 0 AND precio_oferta < precio`);
        await run(`ALTER TABLE productos DROP COLUMN precio_oferta`);
      }

      // ─── 11. Nombre, tipo y marca obligatorios ──────────────────────────────
      await run(`UPDATE productos SET nombre = 'Producto #' || id_producto WHERE nombre IS NULL OR btrim(nombre) = ''`);
      await run(`ALTER TABLE productos ALTER COLUMN nombre SET NOT NULL`);
      const sinTipoOMarca = await rows(
        `SELECT id_producto FROM productos WHERE id_tipo_producto IS NULL OR id_marca IS NULL ORDER BY id_producto`
      );
      if (sinTipoOMarca.length > 0) {
        throw new Error(
          `Migración abortada: ${sinTipoOMarca.length} producto(s) sin tipo de producto o marca asignable ` +
            `(ids: ${sinTipoOMarca.map((r) => r.id_producto).join(", ")}). Asígnalos manualmente y vuelve a migrar.`
        );
      }
      await run(`ALTER TABLE productos ALTER COLUMN id_tipo_producto SET NOT NULL`);
      await run(`ALTER TABLE productos ALTER COLUMN id_marca SET NOT NULL`);

      await h.renombrarRestriccion("productos", "productos_familia_id_fkey", "productos_id_tipo_producto_fkey");
      await h.agregarRestriccion(
        "productos",
        "productos_id_tipo_producto_fkey",
        "FOREIGN KEY (id_tipo_producto) REFERENCES tipos_producto (id_tipo_producto) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await h.agregarRestriccion(
        "productos",
        "productos_id_marca_fkey",
        "FOREIGN KEY (id_marca) REFERENCES marcas_llantas (id_marca) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await h.agregarRestriccion(
        "productos",
        "productos_id_modelo_fkey",
        "FOREIGN KEY (id_modelo) REFERENCES modelos_llantas (id_modelo_llanta) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await h.renombrarRelacion("INDEX", "productos_familia_id", "productos_id_tipo_producto");
      await run(`CREATE INDEX IF NOT EXISTS productos_id_tipo_producto ON productos (id_tipo_producto)`);
      await run(`CREATE INDEX IF NOT EXISTS productos_id_marca ON productos (id_marca)`);
      await run(`CREATE INDEX IF NOT EXISTS productos_id_modelo ON productos (id_modelo)`);

      // ─── 12. Columnas obsoletas de productos ────────────────────────────────
      for (const columna of ["tipo_producto", "id_llanta", "marca_id", "procedencia_id", "linea_id"]) {
        await h.eliminarColumna("productos", columna);
      }
      await run(`DROP TYPE IF EXISTS "enum_productos_tipo_producto"`);

      // ─── 13. Cerrar estructura de marcas y renombrar a `marcas` ─────────────
      await h.eliminarColumna("marcas_llantas", "id_tipo_llanta");
      const unicosPorNombre = await rows(`
        SELECT c.conname FROM pg_constraint c
        WHERE c.conrelid = 'public.marcas_llantas'::regclass AND c.contype = 'u'
          AND array_length(c.conkey, 1) = 1
          AND c.conkey[1] = (
            SELECT attnum FROM pg_attribute
            WHERE attrelid = 'public.marcas_llantas'::regclass AND attname = 'nombre'
          )`);
      for (const { conname } of unicosPorNombre) {
        await run(`ALTER TABLE marcas_llantas DROP CONSTRAINT "${conname}"`);
      }
      await run(`ALTER TABLE marcas_llantas ALTER COLUMN id_tipo_producto SET NOT NULL`);
      await h.agregarRestriccion(
        "marcas_llantas",
        "marcas_id_tipo_producto_fkey",
        "FOREIGN KEY (id_tipo_producto) REFERENCES tipos_producto (id_tipo_producto) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await h.agregarRestriccion("marcas_llantas", "marcas_tipo_nombre_key", "UNIQUE (id_tipo_producto, nombre)");
      if (hayMarcasGenericas) {
        await run(`DROP TABLE marcas`);
      }
      await h.renombrarRelacion("TABLE", "marcas_llantas", "marcas");
      await h.renombrarRelacion("SEQUENCE", "marcas_llantas_id_marca_seq", "marcas_id_marca_seq");
      await h.renombrarRestriccion("marcas", "marcas_llantas_pkey", "marcas_pkey");

      // ─── 14. Modelos (antes: modelos_llantas) ───────────────────────────────
      await h.renombrarRelacion("TABLE", "modelos_llantas", "modelos");
      await h.renombrarRelacion("SEQUENCE", "modelos_llantas_id_modelo_llanta_seq", "modelos_id_modelo_seq");
      if (await h.existeColumna("modelos", "id_modelo_llanta")) {
        await run(`ALTER TABLE modelos RENAME COLUMN id_modelo_llanta TO id_modelo`);
      }
      await h.renombrarRestriccion("modelos", "modelos_llantas_pkey", "modelos_pkey");
      await h.renombrarRestriccion("modelos", "modelos_llantas_marca_nombre_key", "modelos_marca_nombre_key");
      await h.renombrarRestriccion("modelos", "modelos_llantas_id_marca_fkey", "modelos_id_marca_fkey");
      await h.renombrarRelacion("INDEX", "modelos_llantas_id_marca", "modelos_id_marca");
      await h.agregarColumna(
        "modelos",
        "id_tipo_uso",
        "INTEGER REFERENCES tipos_uso (id_tipo_uso) ON UPDATE CASCADE ON DELETE SET NULL"
      );
      await h.agregarColumna("modelos", "activo", "BOOLEAN NOT NULL DEFAULT true");
      await run(`CREATE INDEX IF NOT EXISTS modelos_id_tipo_uso ON modelos (id_tipo_uso)`);

      // ─── 15. Estructuras obsoletas ──────────────────────────────────────────
      await h.eliminarColumna("items_carrito", "id_llanta");
      await h.eliminarColumna("detalle_pedido", "id_llanta");
      // El tipo "enum_imagenes_llantas_tipo_imagen" NO se elimina: en algunas bases
      // imagenes_productos.tipo_imagen reutiliza ese mismo enum.
      await run(`DROP TABLE IF EXISTS imagenes_llantas`);
      await run(`DROP TABLE IF EXISTS llantas`);
      for (const tabla of ["indices_carga", "indices_velocidad", "temperaturas", "sentidos_rotacion", "lineas", "procedencias"]) {
        await run(`DROP TABLE IF EXISTS ${tabla}`);
      }

      // ─── 16. Imágenes: public_id de Cloudinary y una sola principal ─────────
      await h.agregarColumna("imagenes_productos", "public_id", "VARCHAR(255)");
      await run(`
        UPDATE imagenes_productos SET tipo_imagen = 'DETALLE'
        WHERE tipo_imagen = 'PRINCIPAL' AND id_imagen NOT IN (
          SELECT DISTINCT ON (id_producto) id_imagen FROM imagenes_productos
          WHERE tipo_imagen = 'PRINCIPAL' ORDER BY id_producto, orden, id_imagen
        )`);
      await run(`
        UPDATE imagenes_productos SET tipo_imagen = 'PRINCIPAL'
        WHERE id_imagen IN (
          SELECT DISTINCT ON (i.id_producto) i.id_imagen FROM imagenes_productos i
          WHERE NOT EXISTS (
            SELECT 1 FROM imagenes_productos x WHERE x.id_producto = i.id_producto AND x.tipo_imagen = 'PRINCIPAL'
          )
          ORDER BY i.id_producto, i.orden, i.id_imagen
        )`);
      await run(`
        CREATE UNIQUE INDEX IF NOT EXISTS imagenes_productos_una_principal
        ON imagenes_productos (id_producto) WHERE tipo_imagen = 'PRINCIPAL'`);

      // ─── 17. Reglas de negocio también en la BD (defensa adicional) ─────────
      // NOT VALID: aplican a todo INSERT/UPDATE nuevo sin bloquear filas históricas.
      await h.agregarRestriccion("productos", "productos_precio_positivo", "CHECK (precio > 0) NOT VALID");
      await h.agregarRestriccion("productos", "productos_stock_no_negativo", "CHECK (stock >= 0) NOT VALID");
      await h.agregarRestriccion(
        "productos",
        "productos_precio_anterior_mayor",
        "CHECK (precio_anterior IS NULL OR precio_anterior > precio) NOT VALID"
      );
      await h.agregarRestriccion(
        "productos",
        "productos_oferta_requiere_precio_anterior",
        "CHECK (NOT en_oferta OR precio_anterior IS NOT NULL) NOT VALID"
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Revierte la estructura. Las tablas eliminadas se recrean VACÍAS y los datos que solo
  // existen en la nueva arquitectura (medidas, especificaciones, compatibilidades) se pierden.
  // Para volver al estado exacto anterior usar el respaldo pg_dump.
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const h = crearHelpers(queryInterface, transaction);
    const { run, rows } = h;

    try {
      // 17 / 16
      for (const nombre of [
        "productos_precio_positivo",
        "productos_stock_no_negativo",
        "productos_precio_anterior_mayor",
        "productos_oferta_requiere_precio_anterior",
      ]) {
        await run(`ALTER TABLE productos DROP CONSTRAINT IF EXISTS "${nombre}"`);
      }
      await run(`DROP INDEX IF EXISTS imagenes_productos_una_principal`);
      await h.eliminarColumna("imagenes_productos", "public_id");

      // 15 — catálogos antiguos (vacíos)
      await run(`
        CREATE TABLE IF NOT EXISTS procedencias (
          id SERIAL PRIMARY KEY, codigo VARCHAR(10) NOT NULL UNIQUE, nombre VARCHAR(100) NOT NULL,
          descripcion TEXT, activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
        )`);
      await run(`
        CREATE TABLE IF NOT EXISTS lineas (
          id SERIAL PRIMARY KEY, codigo VARCHAR(20) NOT NULL UNIQUE, nombre VARCHAR(100) NOT NULL,
          familia_id INTEGER REFERENCES tipos_producto (id_tipo_producto) ON DELETE SET NULL,
          descripcion TEXT, activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
        )`);
      await run(`
        CREATE TABLE IF NOT EXISTS indices_carga (
          id_indice_carga SERIAL PRIMARY KEY, codigo VARCHAR(10) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      await run(`
        CREATE TABLE IF NOT EXISTS indices_velocidad (
          id_indice_velocidad SERIAL PRIMARY KEY, codigo VARCHAR(5) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      await run(`
        CREATE TABLE IF NOT EXISTS temperaturas (
          id_temperatura SERIAL PRIMARY KEY, codigo VARCHAR(5) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      await run(`
        CREATE TABLE IF NOT EXISTS sentidos_rotacion (
          id_sentido_rotacion SERIAL PRIMARY KEY, descripcion VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);

      // 14 — modelos → modelos_llantas
      await run(`DROP INDEX IF EXISTS modelos_id_tipo_uso`);
      await h.eliminarColumna("modelos", "activo");
      await h.eliminarColumna("modelos", "id_tipo_uso");
      if (await h.existeColumna("modelos", "id_modelo")) {
        await run(`ALTER TABLE modelos RENAME COLUMN id_modelo TO id_modelo_llanta`);
      }
      await h.renombrarRestriccion("modelos", "modelos_pkey", "modelos_llantas_pkey");
      await h.renombrarRestriccion("modelos", "modelos_marca_nombre_key", "modelos_llantas_marca_nombre_key");
      await h.renombrarRestriccion("modelos", "modelos_id_marca_fkey", "modelos_llantas_id_marca_fkey");
      await h.renombrarRelacion("INDEX", "modelos_id_marca", "modelos_llantas_id_marca");
      await h.renombrarRelacion("TABLE", "modelos", "modelos_llantas");
      await h.renombrarRelacion("SEQUENCE", "modelos_id_modelo_seq", "modelos_llantas_id_modelo_llanta_seq");

      // 13 — marcas → marcas_llantas (+ tabla genérica `marcas` vacía)
      await h.renombrarRestriccion("marcas", "marcas_pkey", "marcas_llantas_pkey");
      await h.renombrarRelacion("TABLE", "marcas", "marcas_llantas");
      await h.renombrarRelacion("SEQUENCE", "marcas_id_marca_seq", "marcas_llantas_id_marca_seq");
      await run(`ALTER TABLE marcas_llantas DROP CONSTRAINT IF EXISTS marcas_tipo_nombre_key`);
      await run(`ALTER TABLE marcas_llantas DROP CONSTRAINT IF EXISTS marcas_id_tipo_producto_fkey`);
      const nombresDuplicados = await rows(
        `SELECT nombre FROM marcas_llantas GROUP BY nombre HAVING COUNT(*) > 1`
      );
      if (nombresDuplicados.length === 0) {
        await h.agregarRestriccion("marcas_llantas", "marcas_llantas_nombre_key", "UNIQUE (nombre)");
      }
      await h.agregarColumna(
        "marcas_llantas",
        "id_tipo_llanta",
        "INTEGER REFERENCES tipos_uso (id_tipo_uso) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await run(`UPDATE marcas_llantas SET id_tipo_llanta = (SELECT MIN(id_tipo_uso) FROM tipos_uso)`);
      await h.eliminarColumna("marcas_llantas", "banner_url");
      await run(`
        CREATE TABLE IF NOT EXISTS marcas (
          id SERIAL PRIMARY KEY, codigo VARCHAR(10) NOT NULL UNIQUE, nombre VARCHAR(100) NOT NULL,
          pais VARCHAR(100), imagen_url VARCHAR(500), activo BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
        )`);

      // 9 / 10 / 11 / 12 — productos y llantas
      await run(`
        CREATE TABLE IF NOT EXISTS llantas (
          id_llanta SERIAL PRIMARY KEY,
          id_marca INTEGER NOT NULL REFERENCES marcas_llantas (id_marca) ON UPDATE CASCADE ON DELETE RESTRICT,
          codigo_fabricante VARCHAR(50) UNIQUE,
          ancho INTEGER NOT NULL, perfil INTEGER NOT NULL, rin INTEGER NOT NULL,
          procedencia VARCHAR(100), anio_fabricacion INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          id_modelo_llanta INTEGER REFERENCES modelos_llantas (id_modelo_llanta) ON UPDATE CASCADE ON DELETE RESTRICT,
          id_indice_carga INTEGER REFERENCES indices_carga (id_indice_carga) ON UPDATE CASCADE ON DELETE RESTRICT,
          id_indice_velocidad INTEGER REFERENCES indices_velocidad (id_indice_velocidad) ON UPDATE CASCADE ON DELETE RESTRICT,
          id_temperatura INTEGER REFERENCES temperaturas (id_temperatura) ON UPDATE CASCADE ON DELETE RESTRICT,
          id_tipo_llanta INTEGER REFERENCES tipos_uso (id_tipo_uso) ON UPDATE CASCADE ON DELETE RESTRICT,
          id_sentido_rotacion INTEGER REFERENCES sentidos_rotacion (id_sentido_rotacion) ON UPDATE CASCADE ON DELETE RESTRICT,
          treadwear INTEGER, presion_maxima DECIMAL(5,2), lonas INTEGER, decibeles DECIMAL(4,1), dot VARCHAR(20)
        )`);
      await run(`CREATE INDEX IF NOT EXISTS idx_medidas_llanta ON llantas (ancho, perfil, rin)`);
      if (!(await h.existeTabla("imagenes_llantas"))) {
        await run(`DO $$ BEGIN
          CREATE TYPE "enum_imagenes_llantas_tipo_imagen" AS ENUM ('PRINCIPAL', 'LATERAL', 'DETALLE');
          EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
        await run(`
          CREATE TABLE imagenes_llantas (
            id_imagen SERIAL PRIMARY KEY,
            id_llanta INTEGER NOT NULL REFERENCES llantas (id_llanta) ON UPDATE CASCADE ON DELETE CASCADE,
            url_imagen VARCHAR(500) NOT NULL,
            tipo_imagen "enum_imagenes_llantas_tipo_imagen" NOT NULL DEFAULT 'DETALLE',
            orden INTEGER NOT NULL DEFAULT 0,
            public_id VARCHAR(255), ancho INTEGER, alto INTEGER, formato VARCHAR(50), bytes INTEGER,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`);
      }

      await run(`DO $$ BEGIN
        CREATE TYPE "enum_productos_tipo_producto" AS ENUM ('LLANTA', 'ACCESORIO');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
      await h.agregarColumna("productos", "tipo_producto", `"enum_productos_tipo_producto" NOT NULL DEFAULT 'LLANTA'`);
      await h.agregarColumna("productos", "precio_oferta", "DECIMAL(10,2)");
      await run(`
        UPDATE productos SET precio_oferta = precio, precio = precio_anterior
        WHERE precio_anterior IS NOT NULL AND precio_anterior > precio`);
      await h.agregarColumna(
        "productos",
        "id_llanta",
        "INTEGER REFERENCES llantas (id_llanta) ON UPDATE CASCADE ON DELETE RESTRICT"
      );
      await h.agregarColumna("productos", "marca_id", "INTEGER REFERENCES marcas (id) ON DELETE RESTRICT");
      await h.agregarColumna("productos", "procedencia_id", "INTEGER REFERENCES procedencias (id) ON DELETE RESTRICT");
      await h.agregarColumna("productos", "linea_id", "INTEGER REFERENCES lineas (id) ON DELETE RESTRICT");

      // Reconstruir el vínculo antiguo: productos con medidas → fila en `llantas`;
      // el resto → marca genérica en `marcas` (para que un nuevo `up` los vuelva a migrar).
      if (await h.existeTabla("producto_medidas")) {
        const conMedidas = await rows(`
          SELECT p.id_producto, p.id_marca, p.id_modelo,
                 ROUND(a.valor) AS ancho, ROUND(al.valor) AS perfil, ROUND(r.valor) AS rin
          FROM productos p
          JOIN producto_medidas pm ON pm.id_producto = p.id_producto
          JOIN anchos a ON a.id_ancho = pm.id_ancho
          JOIN altos al ON al.id_alto = pm.id_alto
          JOIN aros r ON r.id_aro = pm.id_aro`);
        for (const p of conMedidas) {
          const [llanta] = await rows(
            `INSERT INTO llantas (id_marca, id_modelo_llanta, ancho, perfil, rin)
             VALUES (:idMarca, :idModelo, :ancho, :perfil, :rin) RETURNING id_llanta`,
            { idMarca: p.id_marca, idModelo: p.id_modelo, ancho: p.ancho, perfil: p.perfil, rin: p.rin }
          );
          await run(`UPDATE productos SET id_llanta = :idLlanta, tipo_producto = 'LLANTA' WHERE id_producto = :idProducto`, {
            idLlanta: llanta.id_llanta,
            idProducto: p.id_producto,
          });
        }
      }
      const sinLlanta = await rows(`
        SELECT DISTINCT p.id_marca, m.nombre, m.pais_origen, m.logo_url
        FROM productos p JOIN marcas_llantas m ON m.id_marca = p.id_marca
        WHERE p.id_llanta IS NULL`);
      for (const marca of sinLlanta) {
        const [generica] = await rows(
          `INSERT INTO marcas (codigo, nombre, pais, imagen_url, activo)
           VALUES (:codigo, :nombre, :pais, :logo, true) RETURNING id`,
          {
            codigo: `M${marca.id_marca}`.slice(0, 10),
            nombre: marca.nombre,
            pais: marca.pais_origen,
            logo: marca.logo_url,
          }
        );
        await run(
          `UPDATE productos SET marca_id = :idGenerica, tipo_producto = 'ACCESORIO'
           WHERE id_marca = :idMarca AND id_llanta IS NULL`,
          { idGenerica: generica.id, idMarca: marca.id_marca }
        );
      }

      for (const columna of [
        "id_marca",
        "id_modelo",
        "precio_anterior",
        "es_nuevo",
        "en_oferta",
        "envio_gratis",
        "aplica_devoluciones",
        "aplica_garantia",
      ]) {
        await h.eliminarColumna("productos", columna);
      }
      await run(`ALTER TABLE productos ALTER COLUMN nombre DROP NOT NULL`);
      if (await h.existeColumna("productos", "id_tipo_producto")) {
        await run(`ALTER TABLE productos ALTER COLUMN id_tipo_producto DROP NOT NULL`);
        await run(`ALTER TABLE productos RENAME COLUMN id_tipo_producto TO familia_id`);
      }
      await h.renombrarRestriccion("productos", "productos_id_tipo_producto_fkey", "productos_familia_id_fkey");
      await h.renombrarRelacion("INDEX", "productos_id_tipo_producto", "productos_familia_id");

      // compatibilidad → id_llanta (solo sobreviven las de productos que tienen llanta)
      await h.agregarColumna("compatibilidad", "id_llanta", "INTEGER");
      await run(`
        UPDATE compatibilidad c SET id_llanta = p.id_llanta
        FROM productos p WHERE p.id_producto = c.id_producto`);
      await run(`DELETE FROM compatibilidad WHERE id_llanta IS NULL`);
      await h.eliminarColumna("compatibilidad", "id_producto");
      await run(`ALTER TABLE compatibilidad ALTER COLUMN id_llanta SET NOT NULL`);
      await h.agregarRestriccion(
        "compatibilidad",
        "compatibilidad_id_llanta_fkey",
        "FOREIGN KEY (id_llanta) REFERENCES llantas (id_llanta) ON UPDATE CASCADE ON DELETE CASCADE"
      );
      await run(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_compatibilidad ON compatibilidad (id_llanta, id_modelo, anio_desde)`
      );

      // 8 / 7 / 6
      await run(`DROP TABLE IF EXISTS producto_especificaciones`);
      await run(`DROP TABLE IF EXISTS producto_medidas`);
      await run(`DROP TABLE IF EXISTS especificaciones_tipos_producto`);
      await run(`DROP TABLE IF EXISTS especificaciones_tecnicas`);
      await run(`DROP TABLE IF EXISTS aros`);
      await run(`DROP TABLE IF EXISTS altos`);
      await run(`DROP TABLE IF EXISTS anchos`);

      // 2 — tipos_uso → tipos_llanta
      if (await h.existeColumna("tipos_uso", "id_tipo_uso")) {
        await run(`ALTER TABLE tipos_uso RENAME COLUMN id_tipo_uso TO id_tipo_llanta`);
      }
      await h.renombrarRestriccion("tipos_uso", "tipos_uso_pkey", "tipos_llanta_pkey");
      await h.renombrarRestriccion("tipos_uso", "tipos_uso_codigo_key", "tipos_llanta_codigo_key");
      await h.renombrarRelacion("TABLE", "tipos_uso", "tipos_llanta");
      await h.renombrarRelacion("SEQUENCE", "tipos_uso_id_tipo_uso_seq", "tipos_llanta_id_tipo_llanta_seq");

      // 1 — tipos_producto → familias
      await h.eliminarColumna("tipos_producto", "requiere_modelo_medidas");
      if (await h.existeColumna("tipos_producto", "id_tipo_producto")) {
        await run(`ALTER TABLE tipos_producto RENAME COLUMN id_tipo_producto TO id`);
      }
      await h.renombrarRestriccion("tipos_producto", "tipos_producto_pkey", "familias_pkey");
      await h.renombrarRestriccion("tipos_producto", "tipos_producto_codigo_key", "familias_codigo_key");
      await h.renombrarRelacion("INDEX", "tipos_producto_codigo", "familias_codigo");
      await h.renombrarRelacion("INDEX", "tipos_producto_activo", "familias_activo");
      await h.renombrarRelacion("TABLE", "tipos_producto", "familias");
      await h.renombrarRelacion("SEQUENCE", "tipos_producto_id_tipo_producto_seq", "familias_id_seq");

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
