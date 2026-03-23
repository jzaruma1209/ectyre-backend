# 📖 API Ectyre — Documentación de Endpoints

> **Base URL (Local):** `http://localhost:8080/api/v1`  
> **Base URL (Producción):** `https://tu-dominio.vercel.app/api/v1`  
> **Versión:** 1.0.0  
> **Autenticación:** Bearer Token (JWT)

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
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123",
  "telefono": "0991234567"
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "message": "Cliente registrado correctamente",
  "data": { "id": 1, "nombre": "Juan Pérez", "email": "juan@example.com" }
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
    "id": 1,
    "nombre": "Juan Pérez",
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
| `idMarca` | number | ID de la marca del vehículo |
| `idModelo` | number | ID del modelo del vehículo |

---

### GET /:id
Obtener detalle de una llanta por ID.

- **Auth:** 🌍 Público

**URL Params:** `id` (number)

---

### POST /
Crear una nueva llanta.

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

## 📊 Resumen de Endpoints

| Módulo | Total | Públicos 🌍 | Autenticados 🔒 | Admin 👑 |
|--------|-------|------------|----------------|---------|
| Clientes | 5 | 2 | 3 | 0 |
| Llantas | 7 | 4 | 0 | 3 |
| Vehículos | 3 | 3 | 0 | 0 |
| Carrito | 5 | 0 | 5* | 0 |
| Pedidos | 4 | 0 | 4 | 0 |
| Direcciones | 4 | 0 | 4 | 0 |
| Admin | 6 | 0 | 0 | 6 |
| **Total** | **34** | **9** | **16** | **9** |

> *El carrito acepta autenticación opcional (también funciona sin token como sesión anónima)

---

## 🔐 Cómo Autenticarse

1. Llamar a `POST /api/v1/clientes/login` con email y password
2. Copiar el `token` de la respuesta
3. Agregar en cada request protegido el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

*Documentación generada automáticamente · Ectyre API v1.0.0*
