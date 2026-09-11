# 📖 API Ectyre — Documentación de Endpoints

> **Base URL (Local):** `http://localhost:8080/api/v1`  
> **Base URL (Producción):** `https://ectyre-backend.vercel.app/api/v1`  
> **Versión:** 1.2.0  
> **Autenticación:** Bearer Token (JWT)

> ⚠️ **v1.2.0 (2026-09-11):** el sistema de productos cambió (ver sección *Productos y Niveles de Inventario*).
> Las secciones antiguas de **Llantas** y **Catálogos de llantas** más abajo quedan como referencia histórica:
> `/llantas` solo mantiene sus `GET` como alias deprecado de `/productos`.

---

## 📦 Productos y Niveles de Inventario (v1.2.0)

### Niveles de Inventario — `/catalogos`
Lectura pública (`?todos=true` incluye inactivos). Escritura 👑.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/catalogos/niveles` | Todo en un request: tiposProducto, marcas, modelos, tiposUso, anchos, altos, aros, especificaciones |
| `GET/POST` | `/catalogos/tipos-producto` | `{ nombre, descripcion?, requiereModeloMedidas, activo? }` (código autogenerado) |
| `PUT/DELETE` | `/catalogos/tipos-producto/:id` | No permite cambiar el flujo si ya hay productos |
| `GET/POST` | `/catalogos/marcas` | `?idTipoProducto=` · multipart: `idTipoProducto, nombre, paisOrigen?, logo (file) \| logoUrl, banner (file) \| bannerUrl` |
| `PUT/DELETE` | `/catalogos/marcas/:id` | Logo y banner obligatorios si el tipo requiere modelo/medidas. `quitarLogo`, `quitarBanner` |
| `GET/POST` | `/catalogos/modelos` | `?idMarca=&idTipoProducto=` · `{ idMarca, nombre, idTipoUso? }` |
| `PUT/DELETE` | `/catalogos/modelos/:id` | |
| `GET/POST` | `/catalogos/tipos-uso` | `{ codigo (≤5), descripcion }` |
| `PUT/DELETE` | `/catalogos/tipos-uso/:id` | |
| `GET/POST` | `/catalogos/medidas/:tipo` | `:tipo` = `anchos` \| `altos` \| `aros` · `{ valor }` |
| `POST` | `/catalogos/medidas/:tipo/lote` | `{ valores: [185, 195] }` → `{ creados, existentes, invalidos }` |
| `PUT/DELETE` | `/catalogos/medidas/:tipo/:id` | `{ valor?, activo? }` |
| `GET/POST` | `/catalogos/especificaciones` | `?idTipoProducto=` · multipart: `nombre, idsTipoProducto ([1,5]), icono (file) \| iconoUrl` |
| `PUT/DELETE` | `/catalogos/especificaciones/:id` | |
| `GET` | `/catalogos/metodos-pago` | Métodos de pago activos (checkout) |

### Productos (Admin) — `/admin/productos` 👑

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/admin/productos` | `?page=&limit=&search=&idTipoProducto=&estado=todos\|activos\|inactivos` (search acepta "225/75R15") |
| `GET` | `/admin/productos/:id` | Detalle con el contrato del card (incluye inactivos) |
| `POST` | `/admin/productos` | Crear. Multipart: `datos` (JSON) + `imagenes` (máx 5). También acepta JSON sin fotos |
| `PUT` | `/admin/productos/:id` | Editar. En `datos`: `imagenesConservar: [ids]`, `principalExistente` o `principalNueva` |
| `PATCH` | `/admin/productos/:id/estado` | `{ activo: true\|false }` |
| `DELETE` | `/admin/productos/:id` | Borrado lógico (activo = false) |
| `PATCH` | `/admin/productos/:id/stock` | `{ stock }` (≥ 0) |

`datos`: `{ idTipoProducto, idMarca, idModelo?, idAncho?, idAlto?, idAro?, nombre, descripcion?, precio, precioAnterior?, stock, especificaciones: [{ idEspecificacion, valor }], esNuevo, enOferta, envioGratis, aplicaDevoluciones, aplicaGarantia, destacado, activo, principalNueva? }`

Errores de validación → `400 { success: false, message, errors: ["…", "…"] }`.

### Catálogo público — `/productos` 🌍

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/productos` | `?idTipoProducto=&idMarca=&destacado=&limit=&offset=` (disponibles primero) |
| `GET` | `/productos/:id` | Detalle (solo activos) |
| `GET` | `/productos/buscar-medida` | `?ancho=&alto=&aro=` (acepta `perfil`/`rin`) |
| `GET` | `/productos/buscar-vehiculo` | `?marca=&modelo=&anio=` |
| `GET` | `/productos/buscar-general` | `?q=225/75R15` o texto → `{ resultados, recomendaciones, tipo, parsedMedida }` |
| `GET` | `/productos/recomendaciones` | `?aro=&excluir=1,2` |

**Contrato del card:** `{ idProducto, nombre, descripcion, tipoProducto, marca { nombre, logoUrl, bannerUrl }, modelo { nombre, tipoUso } | null, medidas { ancho, alto, aro, texto: "225/75R15" } | null, precio, precioAnterior, descuentoPorcentaje, stock, disponible, especificaciones [{ nombre, iconoUrl, valor }], imagenes [{ urlImagen, esPrincipal, orden }], imagenPrincipal, esNuevo, enOferta, envioGratis, aplicaDevoluciones, aplicaGarantia }`

### Compatibilidad — `/compatibilidad`
`GET /vehiculo?idModelo=&anio=` 🌍 · `GET /producto/:id` 🌍 · `POST/PUT/DELETE` 👑 con `{ idProducto, idModelo, anioDesde, anioHasta?, esOriginal? }`

---

## 🔑 Leyenda de Seguridad

| Ícono | Significado |
|-------|-------------|
| 🌍 | Ruta **pública** — sin autenticación |
| 🔒 | Ruta **protegida** — requiere `Authorization: Bearer <token>` |
| 👑 | Ruta **Admin** — requiere JWT + rol Admin |

---

## 📌 Rutas Generales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET`  | `/` | Health check / bienvenida, lista de endpoints | 🌍 |
| `GET`  | `/health` | Estado del servidor | 🌍 |

---

## 👤 Clientes — `/api/v1/clientes`

### POST /registro
Registrar un nuevo cliente.

- **Auth:** 🌍 Público  
- **Rate Limit:** máx 3 registros/hora por IP

**Body (JSON):**
```json
{
  "tipoIdentificacion": "CEDULA",
  "numeroIdentificacion": "0959401332",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "telefono": "0991234567",
  "password": "MiPassword123"
}
```

**Validaciones:**
- `tipoIdentificacion`: `CEDULA | RUC | PASAPORTE`
- `numeroIdentificacion`: 5-20 caracteres
- `nombres`: 2-100 caracteres
- `apellidos`: 2-100 caracteres
- `password`: mínimo 6 caracteres

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Cliente registrado correctamente",
  "data": { "id": 1, "nombres": "Juan", "apellidos": "Pérez", "email": "juan@example.com" }
}
```

---

### POST /login
Iniciar sesión y obtener JWT.

- **Auth:** 🌍 Público  
- **Rate Limit:** máx 5 intentos/15 min por IP

**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "MiPassword123"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /logout
Cerrar sesión del cliente autenticado.

- **Auth:** 🔒 JWT requerido

**Headers:**
```
Authorization: Bearer <token>
```

---

### GET /perfil
Obtener perfil del cliente autenticado.

- **Auth:** 🔒 JWT requerido

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "idCliente": 1,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "telefono": "0991234567",
    "activo": true
  }
}
```

---

### PUT /perfil
Actualizar perfil del cliente autenticado.

- **Auth:** 🔒 JWT requerido

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "telefono": "0997654321"
}
```

---

## 🛞 Llantas — `/api/v1/llantas`

### GET /
Listar todas las llantas con paginación y filtros.

- **Auth:** 🌍 Público  

**Query Params opcionales:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Número de página (default: 1) |
| `limit` | number | Items por página (default: 10) |
| `marca` | string | Filtrar por marca |
| `precio_min` | number | Precio mínimo |
| `precio_max` | number | Precio máximo |
| `destacado` | boolean | Solo llantas destacadas |
| `idMarca` | number | Filtrar por ID de marca |
| `ancho` | number | Filtrar por ancho |
| `perfil` | number | Filtrar por perfil |
| `rin` | number | Filtrar por rin |

---

### GET /buscar-medida
Buscar llantas por medida específica.

- **Auth:** 🌍 Público

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `ancho` | number | Ancho en mm (ej: 205) |
| `perfil` | number | Perfil (ej: 55) |
| `rin` | number | Rin en pulgadas (ej: 16) |

---

### GET /buscar-vehiculo
Buscar llantas compatibles con un vehículo.

- **Auth:** 🌍 Público

**Query Params:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `marca` | string | Nombre de la marca del vehículo |
| `modelo` | string | Nombre del modelo del vehículo |
| `anio` | number | Año del vehículo |

---

### GET /:id
Obtener detalle de una llanta por ID.

- **Auth:** 🌍 Público

**URL Params:** `id` (number)

---

### POST / (JSON)
Crear una nueva llanta (sin imagen).

- **Auth:** 👑 Admin (JWT + rol Admin)

**Body (JSON):**
```json
{
  "idMarca": 1,
  "modelo": "Primacy 4",
  "ancho": 205,
  "perfil": 55,
  "rin": 16,
  "precio": 180.50,
  "stock": 20,
  "descripcion": "Llanta de alto rendimiento",
  "imagen_url": "https://..."
}
```

---

### POST / (con imagen)
Crear llanta con imagen — usa `multipart/form-data`.

- **Auth:** 👑 Admin
- **Content-Type:** `multipart/form-data`

**Campos del form:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `imagen` | File | Archivo .jpg/.jpeg/.png/.webp |
| `idMarca` | number | ID de la marca |
| `modelo` | string | Nombre del modelo |
| `ancho` | number | Ancho en mm |
| `perfil` | number | Perfil |
| `rin` | number | Rin en pulgadas |
| `precio` | decimal | Precio de venta |
| `stock` | integer | Unidades en inventario |
| `descripcion` | string | Descripción opcional |

---

### PUT /:id
Actualizar una llanta existente.

- **Auth:** 👑 Admin  
- **URL Params:** `id` (number)  
- **Body:** mismo esquema que POST

---

### DELETE /:id
Eliminar una llanta.

- **Auth:** 👑 Admin  
- **URL Params:** `id` (number)

---

## 🚗 Vehículos — `/api/v1/vehiculos`

### GET /marcas
Listar todas las marcas de vehículos activas.

- **Auth:** 🌍 Público

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Toyota" },
    { "id": 2, "nombre": "Chevrolet" }
  ]
}
```

---

### GET /marcas/completo
Listar marcas con sus modelos anidados.

- **Auth:** 🌍 Público

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Toyota",
      "modelos": [
        { "id": 1, "nombre": "Corolla" },
        { "id": 2, "nombre": "Hilux" }
      ]
    }
  ]
}
```

---

### GET /marcas/:idMarca/modelos
Listar modelos de una marca específica.

- **Auth:** 🌍 Público  
- **URL Params:** `idMarca` (number)

---

## 📋 Catálogos — `/api/v1/catalogos`

Endpoints para la gestión de datos maestros. **Todos los GET son Públicos (🌍)**, mientras que los **POST/PUT/DELETE requieren permisos de Admin (👑)**.

### GET /
Obtener una vista consolidada de todos los catálogos.

### /modelos-llanta
- `GET /modelos-llanta` 🌍
- `GET /modelos-llanta/:id` 🌍
- `POST /modelos-llanta` 👑
- `PUT /modelos-llanta/:id` 👑
- `DELETE /modelos-llanta/:id` 👑

### /indices-carga
- `GET /indices-carga` 🌍
- `POST /indices-carga` 👑
- `DELETE /indices-carga/:id` 👑

### /indices-velocidad
- `GET /indices-velocidad` 🌍
- `POST /indices-velocidad` 👑
- `DELETE /indices-velocidad/:id` 👑

### /temperaturas
- `GET /temperaturas` 🌍
- `POST /temperaturas` 👑
- `DELETE /temperaturas/:id` 👑

### /tipos-llanta
- `GET /tipos-llanta` 🌍
- `POST /tipos-llanta` 👑
- `PUT /tipos-llanta/:id` 👑
- `DELETE /tipos-llanta/:id` 👑

### /sentidos-rotacion
- `GET /sentidos-rotacion` 🌍
- `POST /sentidos-rotacion` 👑
- `DELETE /sentidos-rotacion/:id` 👑

---

## 🔗 Compatibilidad — `/api/v1/compatibilidad`

### GET /vehiculo
Buscar llantas compatibles con un vehículo específico.
- **Query Params:** `idModelo` (number), `anio` (number)
- **Auth:** 🌍 Público

### GET /llanta/:id
Buscar vehículos compatibles con una llanta específica.
- **Auth:** 🌍 Público

### GET /:id
Obtener detalle de un registro de compatibilidad.
- **Auth:** 🌍 Público

### POST /
Crear un nuevo registro de compatibilidad llanta-vehículo.
- **Auth:** 👑 Admin

### PUT /:id
Actualizar un registro de compatibilidad.
- **Auth:** 👑 Admin

### DELETE /:id
Eliminar un registro de compatibilidad.
- **Auth:** 👑 Admin

---

## 🛒 Carrito — `/api/v1/carrito`

> El carrito soporta usuarios autenticados (JWT) o invitados (sesión anónima).  
> Para invitados, el servidor maneja la sesión automáticamente.

### GET /
Ver el contenido del carrito.

- **Auth:** 🌍/🔒 Opcional (JWT o sesión anónima)

**Headers opcionales:**
```
Authorization: Bearer <token>
```

---

### POST /agregar
Agregar un ítem al carrito.

- **Auth:** 🌍/🔒 Opcional

**Body (JSON):**
```json
{
  "idLlanta": 5,
  "cantidad": 2
}
```

---

### PUT /actualizar/:id
Actualizar la cantidad de un ítem en el carrito.

- **Auth:** 🌍/🔒 Opcional  
- **URL Params:** `id` (ID del ítem en el carrito)

**Body (JSON):**
```json
{
  "cantidad": 4
}
```

---

### DELETE /eliminar/:id
Eliminar un ítem del carrito.

- **Auth:** 🌍/🔒 Opcional  
- **URL Params:** `id` (ID del ítem en el carrito)

---

### DELETE /vaciar
Vaciar todo el carrito.

- **Auth:** 🌍/🔒 Opcional

---

## 📦 Pedidos — `/api/v1/pedidos`

### POST /checkout
Procesar la compra (crear pedido desde el carrito).

- **Auth:** 🔒 JWT requerido

**Body (JSON):**
```json
{
  "idDireccionEntrega": 1,
  "requiereInstalacion": true
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Pedido creado correctamente",
  "data": {
    "id": 42,
    "estado": "PENDIENTE",
    "total": 361.00
  }
}
```

---

### GET /
Listar todos los pedidos del cliente autenticado.

- **Auth:** 🔒 JWT requerido

---

### GET /:id
Ver detalle de un pedido específico.

- **Auth:** 🔒 JWT requerido  
- **URL Params:** `id` (number)

---

### GET /:id/tracking
Ver el estado/tracking de un pedido.

- **Auth:** 🔒 JWT requerido  
- **URL Params:** `id` (number)

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "pedidoId": 42,
    "estado": "EN_PREPARACION",
    "historial": [
      { "estado": "PENDIENTE", "fecha": "2024-01-01T10:00:00Z" },
      { "estado": "CONFIRMADO", "fecha": "2024-01-01T10:30:00Z" },
      { "estado": "EN_PREPARACION", "fecha": "2024-01-01T11:00:00Z" }
    ]
  }
}
```

---

## 🏠 Direcciones — `/api/v1/direcciones`

### GET /
Listar direcciones del cliente autenticado.

- **Auth:** 🔒 JWT requerido

---

### POST /
Crear una nueva dirección de entrega.

- **Auth:** 🔒 JWT requerido

**Body (JSON):**
```json
{
  "provincia": "Pichincha",
  "ciudad": "Quito",
  "direccionCompleta": "Av. Principal 123",
  "referencia": "Frente al parque central",
  "esPrincipal": true
}
```

---

### PUT /:id
Actualizar una dirección.

- **Auth:** 🔒 JWT requerido  
- **URL Params:** `id` (number)  
- **Body:** mismo esquema que POST

---

### DELETE /:id
Eliminar una dirección.

- **Auth:** 🔒 JWT requerido  
- **URL Params:** `id` (number)

---

## 👑 Admin — `/api/v1/admin`

> **Todas las rutas Admin requieren JWT + rol Admin.**  
> **Headers:** `Authorization: Bearer <token_admin>`

### GET /dashboard
Obtener métricas generales del sistema.

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "totalClientes": 150,
    "totalPedidos": 320,
    "pedidosPendientes": 12,
    "ingresosMes": 45000.00
  }
}
```

---

### GET /clientes
Listar todos los clientes.

**Query Params opcionales:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Página |
| `limit` | number | Items por página |
| `search` | string | Buscar por nombre o email |

---

### GET /clientes/:id
Ver detalle de un cliente.

- **URL Params:** `id` (number)

---

### GET /clientes/:id/pedidos
Historial de pedidos de un cliente específico.

- **URL Params:** `id` (number)

---

### PATCH /clientes/:id/toggle
Activar o desactivar un cliente.

- **URL Params:** `id` (number)

---

### GET /pedidos
Listar todos los pedidos del sistema.

**Query Params opcionales:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Página |
| `estado` | string | Filtrar por estado (`PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `ENVIADO`, `ENTREGADO`, `CANCELADO`) |

---

### GET /pedidos/:id
Obtener detalle de un pedido específico.

- **URL Params:** `id` (number)

---

### PATCH /pedidos/:id/estado
Cambiar el estado de un pedido.

- **URL Params:** `id` (number)

**Body (JSON):**
```json
{
  "estado": "CONFIRMADO"
}
```

**Valores válidos para `estado`:**
- `PENDIENTE`
- `CONFIRMADO`
- `EN_PREPARACION`
- `ENVIADO`
- `ENTREGADO`
- `CANCELADO`

---

### PATCH /llantas/:id/stock
Actualizar inventario/stock de una llanta.

- **URL Params:** `id` (number)
- **Body (JSON):**
```json
{
  "cantidad": 5
}
```

---

### GET /reportes/ventas
Reporte de ventas.

**Query Params opcionales:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `desde` | string | Fecha inicio YYYY-MM-DD |
| `hasta` | string | Fecha fin YYYY-MM-DD |

---

### GET /reportes/productos-top
Top productos más vendidos.

**Query Params opcionales:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `limit` | number | Cantidad de productos (default: 10) |

---

### GET /stats/carritos
Estadísticas de carritos actuales.

---

---

## 🖼️ Admin — Imágenes Cloudinary — `/api/v1/admin`

> Gestión de imágenes para productos/llantas en Cloudinary. El listado es público y las operaciones de subida, marcado y eliminación requieren token de Administrador.

### GET /productos/:id/imagenes
Obtener todas las imágenes asociadas a un producto/llanta.
- **Auth:** 🌍 Público
- **URL Params:** `id` (number) - ID del producto/llanta

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "idProducto": 5,
      "url": "https://res.cloudinary.com/ectyre/image/upload/v1/llantas/abc.jpg",
      "esPrincipal": true
    }
  ]
}
```

### POST /productos/:id/imagenes
Subir una imagen individual para un producto/llanta.
- **Auth:** 👑 Admin
- **URL Params:** `id` (number) - ID del producto/llanta
- **Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `imagen` | File | Sí | Archivo de imagen (.jpg, .png, .webp) |
| `tipoImagen` | Text | No | `PRINCIPAL`, `LATERAL`, `DETALLE` |

### POST /productos/:id/imagenes/multiple
Subir múltiples imágenes simultáneas para un producto/llanta (máximo 5).
- **Auth:** 👑 Admin
- **URL Params:** `id` (number) - ID del producto/llanta
- **Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `imagenes` | File[] | Sí | Hasta 5 archivos de imagen |

### PATCH /productos/:id/imagenes/:idImagen/principal
Establecer una imagen como la principal del producto.
- **Auth:** 👑 Admin
- **URL Params:** `id` (number), `idImagen` (number)

### DELETE /imagenes/:idImagen
Eliminar una imagen de la base de datos y de Cloudinary.
- **Auth:** 👑 Admin
- **URL Params:** `idImagen` (number)

---

## 🏷️ Promociones — `/api/v1/admin/promociones`

> Gestión de banners y promociones. El listado y consulta individual son de acceso público para mostrar en el home/banners del cliente.

### GET /
Listar todas las promociones activas.
- **Auth:** 🌍 Público

**Respuesta 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Promo Invierno 2026",
      "imagenUrl": "https://res.cloudinary.com/ectyre/image/upload/v1/promociones/promo1.jpg",
      "activo": true,
      "idLlanta": 3
    }
  ]
}
```

### GET /:id
Obtener detalle de una promoción específica.
- **Auth:** 🌍 Público
- **URL Params:** `id` (number)

### POST /
Crear una nueva promoción publicitaria con subida de imagen.
- **Auth:** 👑 Admin
- **Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `imagen` | File | Sí | Archivo de banner (.jpg, .png, .webp) |
| `nombre` | Text | Sí | Título o nombre de la promoción |
| `activo` | Boolean | No | `true` o `false` (default: true) |
| `idLlanta` | Number | No | ID de la llanta asociada si aplica |

### PUT /:id
Actualizar datos o imagen de una promoción existente.
- **Auth:** 👑 Admin
- **URL Params:** `id` (number)
- **Content-Type:** `multipart/form-data` o `application/json`

### DELETE /:id
Eliminar una promoción publicitaria.
- **Auth:** 👑 Admin
- **URL Params:** `id` (number)

### PATCH /:id/toggle
Alternar rápidamente el estado activo/inactivo de una promoción.
- **Auth:** 👑 Admin
- **URL Params:** `id` (number)

---

## 📊 Resumen de Endpoints (86 en total)

| Módulo | Total | Públicos 🌍 | Auth Opcional 🌍/🔒 | JWT 🔒 | Admin 👑 |
|---|---|---|---|---|---|
| Health Check | 2 | 2 | 0 | 0 | 0 |
| Auth Google | 3 | 3 | 0 | 0 | 0 |
| Clientes | 5 | 2 | 0 | 3 | 0 |
| Llantas | 9 | 6 | 0 | 0 | 3 |
| Vehículos | 3 | 3 | 0 | 0 | 0 |
| Carrito | 5 | 0 | 5* | 0 | 0 |
| Pedidos | 4 | 0 | 0 | 4 | 0 |
| Direcciones | 4 | 0 | 0 | 4 | 0 |
| Admin — General | 12 | 0 | 0 | 0 | 12 |
| Admin — Imágenes | 5 | 1 | 0 | 0 | 4 |
| Catálogos | 22 | 8 | 0 | 0 | 14 |
| Compatibilidad | 6 | 3 | 0 | 0 | 3 |
| Promociones | 6 | 2 | 0 | 0 | 4 |
| **Total** | **86** | **30** | **5** | **11** | **40** |

> *El carrito acepta autenticación opcional (sesión anónima o JWT)

---

## 🔐 Cómo Autenticarse

### JWT (Email/Password)
1. Llamar a `POST /api/v1/clientes/login` con email y password
2. Copiar el `token` de la respuesta
3. Agregar en cada request protegido el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Google OAuth 2.0
1. Abrir en el navegador: `GET /api/v1/auth/google`
2. Seleccionar cuenta de Google
3. Google redirige a `{CLIENT_URL}/auth/callback?token=...`
4. Usar el token JWT de la URL para llamadas autenticadas

---

Ectyre API v1.1.0 · Última actualización: 2026-06-25 · 86 endpoints verificados
