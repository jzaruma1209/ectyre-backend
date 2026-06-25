# Base de Datos — Documentación para el Agente

## Motor
PostgreSQL — ORM: Sequelize

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

### Flujo de creación en cascada (obligatorio respetar este orden):

```
marcas_llantas
    └── modelos_llantas
indices_carga
indices_velocidad
temperaturas
tipos_llanta
sentidos_rotacion
    └── llantas  (usa todo lo anterior)
            └── productos  (card pública, usa id_llanta)
                    └── imagenes_productos
                    └── imagenes_promocion (opcional)
```

---

### `marcas_llantas`
Marcas fabricantes de llantas (Michelin, Bridgestone, etc.)

| Columna | Tipo | Notas |
|---|---|---|
| id_marca | serial PK | |
| nombre | varchar(100) | UNIQUE |
| descripcion | text | nullable |
| pais_origen | varchar(100) | nullable |
| logo_url | varchar(500) | nullable |
| activo | boolean | default true |

### `modelos_llantas`
Líneas/modelos de una marca (ej: Michelin → Pilot Sport 4)

| Columna | Tipo | Notas |
|---|---|---|
| id_modelo_llanta | serial PK | |
| id_marca | int FK → marcas_llantas | RESTRICT delete |
| nombre | varchar(100) | UNIQUE por marca |

### `indices_carga`
Catálogo de índices de carga (ej: 91, 94, 100...)

| Columna | Tipo | Notas |
|---|---|---|
| id_indice_carga | serial PK | |
| codigo | varchar(10) | UNIQUE |

### `indices_velocidad`
Catálogo de índices de velocidad (ej: H, V, W, Y...)

| Columna | Tipo | Notas |
|---|---|---|
| id_indice_velocidad | serial PK | |
| codigo | varchar(5) | UNIQUE |

### `temperaturas`
Catálogo de ratings de temperatura (A, B, C)

| Columna | Tipo | Notas |
|---|---|---|
| id_temperatura | serial PK | |
| codigo | varchar(5) | UNIQUE |

### `tipos_llanta`
Tipo de uso de la llanta (verano, invierno, todo terreno, etc.)

| Columna | Tipo | Notas |
|---|---|---|
| id_tipo_llanta | serial PK | |
| codigo | varchar(5) | UNIQUE |
| descripcion | varchar(150) | |

### `sentidos_rotacion`
Direccionalidad de la llanta (direccional, simétrica, asimétrica)

| Columna | Tipo | Notas |
|---|---|---|
| id_sentido_rotacion | serial PK | |
| descripcion | varchar(50) | UNIQUE |

---

### `llantas`
Entidad técnica de la llanta. NO tiene precio, NO tiene imágenes. Es el dato puro del producto físico.

| Columna | Tipo | Notas |
|---|---|---|
| id_llanta | serial PK | |
| id_marca | int FK → marcas_llantas | RESTRICT |
| id_modelo_llanta | int FK → modelos_llantas | RESTRICT, nullable |
| codigo_fabricante | varchar(50) | UNIQUE, nullable |
| ancho | int | ej: 205 |
| perfil | int | ej: 55 |
| rin | int | ej: 16 |
| procedencia | varchar(100) | nullable |
| anio_fabricacion | int | nullable |
| id_indice_carga | int FK → indices_carga | nullable |
| id_indice_velocidad | int FK → indices_velocidad | nullable |
| id_temperatura | int FK → temperaturas | nullable |
| id_tipo_llanta | int FK → tipos_llanta | nullable |
| id_sentido_rotacion | int FK → sentidos_rotacion | nullable |
| treadwear | int | nullable |
| presion_maxima | numeric(5,2) | nullable |
| lonas | int | nullable |
| decibeles | numeric(4,1) | nullable |
| dot | varchar(20) | nullable |

> ⚠️ `llantas` NO tiene `id_producto`. La relación va en la dirección opuesta: `productos.id_llanta`

---

### `productos`
Card pública del producto en la tienda. Es la tabla principal del catálogo. Contiene precio, stock, imágenes y apunta a la entidad técnica correspondiente.

| Columna | Tipo | Notas |
|---|---|---|
| id_producto | serial PK | |
| tipo_producto | enum | LLANTA (futuro: ARO, ACEITE, etc.) |
| nombre | varchar(150) | nullable |
| precio | numeric(10,2) | |
| precio_oferta | numeric(10,2) | nullable |
| stock | int | default 0 |
| descripcion | text | nullable |
| activo | boolean | default true |
| destacado | boolean | default false |
| id_imagen_promocion | int FK → imagenes_promocion | nullable, SET NULL on delete |
| id_llanta | int FK → llantas | nullable, RESTRICT on delete |

> ✅ Una misma llanta puede tener N productos (combos, precios distintos, etc.)
> ✅ En el futuro: `tipo_producto = 'ARO'` apuntará a una tabla `aros` de la misma forma

---

### `imagenes_productos`
Imágenes de detalle del producto. Mínimo 1, máximo 5 (validar desde la app).

| Columna | Tipo | Notas |
|---|---|---|
| id_imagen | serial PK | |
| id_producto | int FK → productos | CASCADE delete |
| url_imagen | varchar(500) | |
| tipo_imagen | enum | default 'DETALLE' |
| orden | int | default 0, para ordenar el carrusel |

### `imagenes_promocion`
Imágenes tipo banner/promo que se muestran en la card del producto. Se pueden reutilizar y cambiar en cualquier momento.

| Columna | Tipo | Notas |
|---|---|---|
| id_imagen_promocion | serial PK | |
| url_imagen | varchar(500) | |
| nombre | varchar(150) | nullable |
| activo | boolean | default true |

---

## Módulo 3 — Carrito

### `carritos`
Soporta carritos de sesiones anónimas (sin login) y logueadas.

| Columna | Tipo | Notas |
|---|---|---|
| id_carrito | serial PK | |
| id_cliente | int FK → clientes | nullable (anónimo) |
| sesion_id | varchar(255) | para usuarios no logueados |
| estado | enum | ACTIVO / ABANDONADO |
| fecha_abandonado | timestamptz | nullable |

### `items_carrito`

| Columna | Tipo | Notas |
|---|---|---|
| id_item | serial PK | |
| id_carrito | int FK → carritos | CASCADE delete |
| id_producto | int FK → productos | RESTRICT delete |
| cantidad | int | default 1 |
| precio_unitario | numeric(10,2) | precio al momento de agregar |

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

Permite responder: ¿qué llantas sirven para mi vehículo?

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
Relaciona llantas con modelos de vehículos por rango de años.

| Columna | Tipo | Notas |
|---|---|---|
| id_compatibilidad | serial PK | |
| id_llanta | int FK → llantas | CASCADE delete |
| id_modelo | int FK → modelos_vehiculos | CASCADE delete |
| anio_desde | int | |
| anio_hasta | int | nullable (hasta hoy) |
| es_original | boolean | default false |

---

## Módulo 6 — Sequelize

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
productos         →  imagenes_productos
productos         →  imagenes_promocion
productos         →  llantas         →  marcas_llantas
                                     →  modelos_llantas
                                     →  indices_carga
                                     →  indices_velocidad
                                     →  temperaturas
                                     →  tipos_llanta
                                     →  sentidos_rotacion
llantas           →  compatibilidad  →  modelos_vehiculos  →  marcas_vehiculos
```

---

## JOINs más comunes

### Obtener producto con datos de llanta
```sql
SELECT p.*, l.ancho, l.perfil, l.rin, ml.nombre as modelo, ma.nombre as marca
FROM productos p
LEFT JOIN llantas l ON l.id_llanta = p.id_llanta
LEFT JOIN modelos_llantas ml ON ml.id_modelo_llanta = l.id_modelo_llanta
LEFT JOIN marcas_llantas ma ON ma.id_marca = l.id_marca
WHERE p.id_producto = :id;
```

### Llantas compatibles con un vehículo
```sql
SELECT l.*, p.*
FROM compatibilidad c
JOIN llantas l ON l.id_llanta = c.id_llanta
JOIN productos p ON p.id_llanta = l.id_llanta
WHERE c.id_modelo = :id_modelo
AND (:anio BETWEEN c.anio_desde AND COALESCE(c.anio_hasta, 9999))
AND p.activo = true;
```
