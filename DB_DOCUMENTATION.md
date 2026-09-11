# Base de Datos — Documentación para el Agente

## Motor
PostgreSQL — ORM: Sequelize

> Última actualización: 2026-09-11 — migración `20260911000001-arquitectura-productos`
> (arquitectura de productos: Tipo de Producto → Marca → Modelo → Medidas).

---

## Regla general
Antes de crear, modificar o revisar cualquier endpoint, modelo Sequelize, migración o query, leer este archivo completo.

---

## Estructura general

La base de datos está dividida en 6 módulos:

1. **Clientes & autenticación**
2. **Catálogo de productos** ← módulo principal
3. **Carrito**
4. **Pedidos & pagos**
5. **Compatibilidad vehicular**
6. **Contenido / imágenes**

---

## Módulo 1 — Clientes & autenticación

### `clientes`
Tabla principal de usuarios. Soporta registro manual y Google OAuth.

| Columna | Tipo | Notas |
|---|---|---|
| id_cliente | serial PK | |
| tipo_identificacion | enum | |
| numero_identificacion | varchar(20) | UNIQUE |
| nombres | varchar(100) | |
| apellidos | varchar(100) | |
| email | varchar(150) | UNIQUE |
| telefono | varchar(15) | |
| password_hash | varchar(255) | nullable (si usa Google) |
| activo | boolean | default true |
| role | enum | default 'cliente' |
| google_id | varchar(255) | UNIQUE, nullable |
| created_at / updated_at | timestamptz | |

### `direcciones`
Direcciones de entrega por cliente. Un cliente puede tener varias.

| Columna | Tipo | Notas |
|---|---|---|
| id_direccion | serial PK | |
| id_cliente | int FK → clientes | CASCADE delete |
| provincia | varchar(100) | |
| ciudad | varchar(100) | |
| direccion_completa | text | |
| referencia | text | nullable |
| es_principal | boolean | default false |

---

## Módulo 2 — Catálogo de productos

### Concepto: dos flujos según el tipo de producto

```
Flujo A (tipos_producto.requiere_modelo_medidas = true, ej: LLANTAS)
  Tipo de Producto → Marca → Modelo → Medidas (Ancho / Alto / Aro)

Flujo B (requiere_modelo_medidas = false, ej: BATERÍAS, ACCESORIOS, TUBOS, AROS)
  Tipo de Producto → Marca
```

### Orden de carga ("Niveles de Inventario" — todo debe existir antes de crear un producto)

```
tipos_producto  (+ bandera requiere_modelo_medidas)
    └── marcas  (pertenece a un tipo; logo + banner obligatorios si el tipo requiere modelo/medidas)
            └── modelos  (pertenece a una marca; solo si el tipo lo requiere)
                    └── tipos_uso  (dato informativo del modelo: AT, MT, HP…)
anchos / altos / aros            (catálogos planos, independientes de marca y modelo)
especificaciones_tecnicas        (con N tipos de producto donde aplican)

productos
    ├── producto_medidas           (0..1 — solo si el tipo requiere medidas)
    ├── producto_especificaciones  (0..N — valor por especificación)
    └── imagenes_productos         (máx 5, exactamente 1 PRINCIPAL si tiene fotos)
```

---

### `tipos_producto`
Catálogo de tipos (antes `familias`). Define qué flujo usa el formulario de producto.

| Columna | Tipo | Notas |
|---|---|---|
| id_tipo_producto | serial PK | |
| codigo | varchar(10) | UNIQUE (autogenerado 001, 002…) |
| nombre | varchar(100) | LLANTAS, AROS, ACEITES, ACCESORIOS, BATERÍAS, TUBOS |
| descripcion | text | nullable |
| requiere_modelo_medidas | boolean | NOT NULL default false. true = flujo A |
| activo | boolean | default true |

> No se puede cambiar `requiere_modelo_medidas` si el tipo ya tiene productos (validado en servicio).

### `marcas`
Marcas por tipo de producto (antes `marcas_llantas`; la tabla genérica `marcas` anterior se fusionó aquí).

| Columna | Tipo | Notas |
|---|---|---|
| id_marca | serial PK | |
| id_tipo_producto | int FK → tipos_producto | NOT NULL, RESTRICT |
| nombre | varchar(100) | UNIQUE por tipo (`marcas_tipo_nombre_key`) |
| descripcion | text | nullable |
| pais_origen | varchar(100) | nullable |
| logo_url | varchar(500) | obligatorio si el tipo requiere modelo/medidas (servicio) |
| banner_url | varchar(500) | obligatorio si el tipo requiere modelo/medidas (servicio) |
| activo | boolean | default true |

### `modelos`
Modelos de una marca (antes `modelos_llantas`). Un modelo pertenece a UNA sola marca.

| Columna | Tipo | Notas |
|---|---|---|
| id_modelo | serial PK | |
| id_marca | int FK → marcas | NOT NULL, RESTRICT |
| id_tipo_uso | int FK → tipos_uso | nullable, SET NULL |
| nombre | varchar(100) | UNIQUE por marca (`modelos_marca_nombre_key`) |
| activo | boolean | default true |

> Solo se permiten modelos para marcas cuyo tipo tiene `requiere_modelo_medidas = true` (servicio).
> ⚠️ No confundir con `modelos_vehiculos` (módulo 5).

### `tipos_uso`
Tipo de uso del modelo (antes `tipos_llanta`). Informativo; se muestra como insignia en el card.

| Columna | Tipo | Notas |
|---|---|---|
| id_tipo_uso | serial PK | |
| codigo | varchar(5) | UNIQUE (AT, MT, HT, HP, RT, XT, ST) |
| descripcion | varchar(150) | |

### `anchos` / `altos` / `aros`
Tres catálogos planos e independientes. Se precargan valores comunes (el aro admite decimales: 22.5).

| Columna | Tipo | Notas |
|---|---|---|
| id_ancho / id_alto / id_aro | serial PK | |
| valor | numeric(6,2) | UNIQUE, CHECK > 0 (el modelo lo devuelve como número) |
| activo | boolean | default true (inactivo = no se ofrece al crear productos) |

### `especificaciones_tecnicas`
Catálogo de especificaciones (Tracción, Temperatura, Voltaje, Amperaje…). El valor se asigna por producto.

| Columna | Tipo | Notas |
|---|---|---|
| id_especificacion | serial PK | |
| nombre | varchar(100) | UNIQUE |
| icono_url | varchar(500) | nullable |
| activo | boolean | default true |

### `especificaciones_tipos_producto`
Relación N:N — a qué tipos de producto aplica cada especificación (mínimo 1, validado en servicio).

| Columna | Tipo | Notas |
|---|---|---|
| id_especificacion | int FK → especificaciones_tecnicas | PK compuesta, CASCADE |
| id_tipo_producto | int FK → tipos_producto | PK compuesta, CASCADE |

---

### `productos`
Card pública del producto. Referencia directa a tipo, marca y (si aplica) modelo.

| Columna | Tipo | Notas |
|---|---|---|
| id_producto | serial PK | |
| id_tipo_producto | int FK → tipos_producto | NOT NULL, RESTRICT |
| id_marca | int FK → marcas | NOT NULL, RESTRICT. Debe pertenecer al mismo tipo |
| id_modelo | int FK → modelos | nullable, RESTRICT. Obligatorio en flujo A y de la misma marca |
| nombre | varchar(150) | NOT NULL |
| descripcion | text | nullable |
| precio | numeric(10,2) | NOT NULL — precio de venta (lo que paga el cliente). CHECK > 0 |
| precio_anterior | numeric(10,2) | nullable — precio tachado. CHECK > precio |
| stock | int | default 0, CHECK ≥ 0. Stock 0 = "Agotado" (no bloquea la creación) |
| es_nuevo | boolean | default false |
| en_oferta | boolean | default false. CHECK: si es true exige precio_anterior |
| envio_gratis | boolean | default false |
| aplica_devoluciones | boolean | default false |
| aplica_garantia | boolean | default false |
| activo | boolean | default true (borrado lógico) |
| destacado | boolean | default false |
| id_imagen_promocion | int FK → imagenes_promocion | nullable, SET NULL on delete |

> ⚠️ Antes existían `precio_oferta` (precio rebajado), `tipo_producto` (enum), `id_llanta`, `familia_id`,
> `marca_id`, `procedencia_id` y `linea_id`. Ya no existen.
> Las CHECK se crearon `NOT VALID` (aplican a todo INSERT/UPDATE nuevo).

### `producto_medidas`
Combinación Ancho + Alto + Aro de un producto. Solo existe si el tipo requiere medidas.

| Columna | Tipo | Notas |
|---|---|---|
| id_producto_medida | serial PK | |
| id_producto | int FK → productos | UNIQUE, CASCADE |
| id_ancho | int FK → anchos | RESTRICT |
| id_alto | int FK → altos | RESTRICT |
| id_aro | int FK → aros | RESTRICT |

### `producto_especificaciones`
Valor de cada especificación en un producto (ej: Tracción → "A").

| Columna | Tipo | Notas |
|---|---|---|
| id_producto_especificacion | serial PK | |
| id_producto | int FK → productos | CASCADE |
| id_especificacion | int FK → especificaciones_tecnicas | RESTRICT |
| valor | varchar(100) | NOT NULL |

> UNIQUE (id_producto, id_especificacion). La especificación debe aplicar al tipo del producto (servicio).

### `imagenes_productos`
Fotos del producto. **Máximo 5** (validado en backend) y **una sola PRINCIPAL**.

| Columna | Tipo | Notas |
|---|---|---|
| id_imagen | serial PK | |
| id_producto | int FK → productos | CASCADE delete |
| url_imagen | varchar(500) | |
| public_id | varchar(255) | nullable — id de Cloudinary para borrar el archivo |
| tipo_imagen | enum | PRINCIPAL / LATERAL / DETALLE. PRINCIPAL = foto principal |
| orden | int | default 0, orden del carrusel |

> Índice único parcial `imagenes_productos_una_principal` (id_producto) WHERE tipo_imagen = 'PRINCIPAL'.
> Si no se marca ninguna, el backend asigna la primera como principal.

### `imagenes_promocion`
Imágenes tipo banner/promo que se muestran en la card del producto. Se pueden reutilizar y cambiar en cualquier momento.

| Columna | Tipo | Notas |
|---|---|---|
| id_imagen_promocion | serial PK | |
| url_imagen | varchar(500) | |
| nombre | varchar(150) | nullable |
| activo | boolean | default true |

### Tablas eliminadas en la migración 2026-09-11
`llantas`, `imagenes_llantas`, `indices_carga`, `indices_velocidad`, `temperaturas`, `sentidos_rotacion`,
`lineas`, `procedencias` y la tabla genérica `marcas` (fusionada en la nueva `marcas`).
Los datos técnicos de llantas ahora son especificaciones técnicas con valor por producto.

---

## Módulo 3 — Carrito

### `carritos`
Soporta carritos de sesiones anónimas (sin login) y logueadas.

| Columna | Tipo | Notas |
|---|---|---|
| id_carrito | serial PK | |
| id_cliente | int FK → clientes | nullable (anónimo) |
| sesion_id | varchar(255) | para usuarios no logueados |
| estado | enum | ACTIVO / ABANDONADO / CONVERTIDO |
| fecha_abandonado | timestamptz | nullable |

### `items_carrito`

| Columna | Tipo | Notas |
|---|---|---|
| id_item | serial PK | |
| id_carrito | int FK → carritos | CASCADE delete |
| id_producto | int FK → productos | RESTRICT delete |
| cantidad | int | default 1 |
| precio_unitario | numeric(10,2) | `productos.precio` al momento de agregar |

---

## Módulo 4 — Pedidos & pagos

### `pedidos`

| Columna | Tipo | Notas |
|---|---|---|
| id_pedido | serial PK | |
| numero_pedido | varchar(50) | UNIQUE, referencia legible |
| id_cliente | int FK → clientes | RESTRICT |
| id_direccion_entrega | int FK → direcciones | RESTRICT |
| subtotal | numeric(10,2) | |
| iva | numeric(10,2) | |
| costo_envio | numeric(10,2) | default 0 |
| total | numeric(10,2) | |
| estado | enum | PENDIENTE / ... |
| requiere_instalacion | boolean | default false |
| fecha_estimada_entrega | timestamptz | nullable |
| observaciones | text | nullable |

### `detalle_pedido`

| Columna | Tipo | Notas |
|---|---|---|
| id_detalle | serial PK | |
| id_pedido | int FK → pedidos | CASCADE delete |
| id_producto | int FK → productos | RESTRICT delete |
| cantidad | int | |
| precio_unitario | numeric(10,2) | precio al momento de compra |
| subtotal | numeric(10,2) | |

### `metodos_pago`

| Columna | Tipo | Notas |
|---|---|---|
| id_metodo | serial PK | |
| nombre | varchar(100) | UNIQUE |
| codigo | varchar(50) | UNIQUE |
| descripcion | text | nullable |
| activo | boolean | default true |

### `pagos`

| Columna | Tipo | Notas |
|---|---|---|
| id_pago | serial PK | |
| id_pedido | int FK → pedidos | RESTRICT |
| id_metodo_pago | int FK → metodos_pago | RESTRICT |
| monto | numeric(10,2) | |
| estado_pago | enum | PENDIENTE / ... |
| comprobante_url | varchar(500) | nullable |
| transaccion_id | varchar(255) | nullable |
| observaciones | text | nullable |

---

## Módulo 5 — Compatibilidad vehicular

Permite responder: ¿qué productos sirven para mi vehículo?

### `marcas_vehiculos`

| Columna | Tipo | Notas |
|---|---|---|
| id_marca_vehiculo | serial PK | |
| nombre | varchar(100) | UNIQUE |
| logo_url | varchar(500) | nullable |
| activo | boolean | default true |

### `modelos_vehiculos`

| Columna | Tipo | Notas |
|---|---|---|
| id_modelo | serial PK | |
| id_marca_vehiculo | int FK → marcas_vehiculos | RESTRICT |
| nombre | varchar(100) | |
| tipo_vehiculo | enum | SEDAN / SUV / ... |

### `compatibilidad`
Relaciona productos con modelos de vehículos por rango de años (antes apuntaba a `llantas`).

| Columna | Tipo | Notas |
|---|---|---|
| id_compatibilidad | serial PK | |
| id_producto | int FK → productos | NOT NULL, CASCADE delete |
| id_modelo | int FK → modelos_vehiculos | CASCADE delete (modelo de VEHÍCULO) |
| anio_desde | int | |
| anio_hasta | int | nullable (hasta hoy) |
| es_original | boolean | default false |

> UNIQUE `idx_unique_compatibilidad` (id_producto, id_modelo, anio_desde)

---

## Módulo 6 — Contenido / Sequelize

### `media_items`
Biblioteca de medios (Cloudinary) usada por el panel admin. Sin relaciones obligatorias.

### `SequelizeMeta`
Tabla interna de Sequelize para control de migraciones. No tocar manualmente.

---

## Relaciones clave resumidas

```
clientes          →  direcciones
clientes          →  carritos
clientes          →  pedidos
pedidos           →  detalle_pedido  →  productos
pedidos           →  pagos           →  metodos_pago
pedidos           →  direcciones
carritos          →  items_carrito   →  productos
tipos_producto    →  marcas          →  modelos  →  tipos_uso
tipos_producto    ↔  especificaciones_tecnicas   (especificaciones_tipos_producto)
productos         →  tipos_producto / marcas / modelos (nullable)
productos         →  producto_medidas → anchos / altos / aros
productos         →  producto_especificaciones → especificaciones_tecnicas
productos         →  imagenes_productos
productos         →  imagenes_promocion
productos         →  compatibilidad  →  modelos_vehiculos  →  marcas_vehiculos
```

---

## Reglas de negocio (validadas en `services/producto.services.js`)

1. Si el tipo requiere modelo y medidas: modelo, ancho, alto y aro son obligatorios. Si no, no se guardan.
2. El modelo debe pertenecer a la marca seleccionada.
3. Máximo 5 fotos por producto (multer + servicio).
4. Siempre exactamente una foto principal si hay fotos (la primera por defecto).
5. `precio_anterior` > `precio`.
6. `en_oferta = true` exige `precio_anterior`.
7. Solo especificaciones asociadas al tipo del producto.
8. La marca debe existir previamente (y pertenecer al tipo elegido).
9. `precio` > 0.
10. Stock 0 permitido; la API devuelve `disponible = false` y el card muestra "Agotado".

---

## JOINs más comunes

### Obtener producto con marca, modelo y medida
```sql
SELECT p.*, m.nombre AS marca, mo.nombre AS modelo,
       a.valor AS ancho, al.valor AS alto, r.valor AS aro
FROM productos p
JOIN marcas m ON m.id_marca = p.id_marca
LEFT JOIN modelos mo ON mo.id_modelo = p.id_modelo
LEFT JOIN producto_medidas pm ON pm.id_producto = p.id_producto
LEFT JOIN anchos a ON a.id_ancho = pm.id_ancho
LEFT JOIN altos al ON al.id_alto = pm.id_alto
LEFT JOIN aros r ON r.id_aro = pm.id_aro
WHERE p.id_producto = :id;
```

### Productos compatibles con un vehículo
```sql
SELECT p.*
FROM compatibilidad c
JOIN productos p ON p.id_producto = c.id_producto
WHERE c.id_modelo = :id_modelo
AND (:anio BETWEEN c.anio_desde AND COALESCE(c.anio_hasta, 9999))
AND p.activo = true;
```
