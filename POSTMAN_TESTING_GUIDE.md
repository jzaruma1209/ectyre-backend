# 🛞 Guía Completa de Testing — Ectyre API v1.0

> Toda la información necesaria para testear la API en Postman.

---

## 📋 Información General

| Campo | Valor |
|-------|-------|
| **Base URL (Local)** | `http://localhost:8080/api/v1` |
| **Base URL (Producción)** | `https://api.ectyre.com/api/v1` _(pendiente)_ |
| **Puerto** | `8080` |
| **Prefijo de rutas** | `/api/v1` |
| **Autenticación** | JWT Bearer Token |
| **Token expira** | 7 días |
| **Content-Type** | `application/json` |

---

## 🔑 Credenciales de Prueba (del Seeder 08)

### 👑 Usuario Admin
```
Email:    admin@ectyre.com
Password: Admin2026#Ectyre
```

### 👤 Usuario Normal (Carlos)
```
Email:    carlos.mendoza@test.com
Password: Test1234!
```

### 👤 Usuario Normal (María)
```
Email:    maria.torres@test.com
Password: Test1234!
```

---

## 🌐 Environment de Postman

Crear un Environment llamado **"Ectyre API - Local"** con estas variables:

| Variable | Initial Value | Current Value | Tipo |
|----------|--------------|---------------|------|
| `baseUrl` | `http://localhost:8080/api/v1` | `http://localhost:8080/api/v1` | default |
| `token` | _(vacío)_ | _(se llena con Login)_ | default |
| `adminToken` | _(vacío)_ | _(se llena con Login admin)_ | secret |

---

## 📡 Endpoints Completos (36 requests en 8 módulos)

---

### 🏥 1. Health Check (2 endpoints — Públicos)

#### GET Bienvenida
```
GET http://localhost:8080/
```
**Respuesta esperada (200):**
```json
{
  "success": true,
  "message": "Bienvenido a API Ectyre",
  "version": "1.0.0",
  "environment": "development",
  "endpoints": {
    "llantas": "/api/v1/llantas",
    "clientes": "/api/v1/clientes",
    "carrito": "/api/v1/carrito",
    "pedidos": "/api/v1/pedidos",
    "direcciones": "/api/v1/direcciones",
    "vehiculos": "/api/v1/vehiculos",
    "admin": "/api/v1/admin"
  }
}
```

#### GET Health Check
```
GET http://localhost:8080/health
```
**Respuesta esperada (200):**
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2026-03-23T12:00:00.000Z"
}
```

---

### 👤 2. Clientes (5 endpoints)

#### POST Registro — 🌍 Público
```
POST {{baseUrl}}/clientes/registro
Content-Type: application/json
```
**Body:**
```json
{
  "tipoIdentificacion": "CEDULA",
  "numeroIdentificacion": "0959401332",
  "nombres": "Paul",
  "apellidos": "Zaruma",
  "email": "zpaul3984@gmail.com",
  "telefono": "0991234567",
  "password": "123456"
}
```
> **Validaciones requeridas:**
> - `tipoIdentificacion`: CEDULA | RUC | PASAPORTE
> - `numeroIdentificacion`: 5-20 caracteres
> - `nombres`: 2-100 caracteres
> - `apellidos`: 2-100 caracteres
> - `email`: email válido
> - `telefono`: 7-15 caracteres
> - `password`: mínimo 6 caracteres
>
> **Rate limit:** 3 registros/hora por IP

#### POST Login — 🌍 Público
```
POST {{baseUrl}}/clientes/login
Content-Type: application/json
```
**Body (usuario normal):**
```json
{
  "email": "carlos.mendoza@test.com",
  "password": "Test1234!"
}
```
**Body (admin):**
```json
{
  "email": "admin@ectyre.com",
  "password": "Admin2026#Ectyre"
}
```
**Respuesta esperada (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "cliente": {
      "idCliente": 2,
      "email": "carlos.mendoza@test.com",
      "nombres": "Carlos",
      "apellidos": "Mendoza"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Test Script (guardar token automático):**
```javascript
const res = pm.response.json();
if (res.data && res.data.token) {
  pm.environment.set('token', res.data.token);
  console.log('✅ Token guardado en {{token}}');
}
```
> **Rate limit:** 5 intentos/15min por IP

#### POST Logout — 🔒 JWT
```
POST {{baseUrl}}/clientes/logout
Authorization: Bearer {{token}}
```

#### GET Ver Perfil — 🔒 JWT
```
GET {{baseUrl}}/clientes/perfil
Authorization: Bearer {{token}}
```

#### PUT Actualizar Perfil — 🔒 JWT
```
PUT {{baseUrl}}/clientes/perfil
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "nombres": "Carlos Actualizado",
  "telefono": "0997654321"
}
```

---

### 🛞 3. Llantas (7 endpoints)

#### GET Listar Llantas — 🌍 Público
```
GET {{baseUrl}}/llantas
```
**Query params opcionales:**
- `destacado=true` — solo llantas destacadas
- `idMarca=1` — filtrar por marca
- `ancho=205` — filtrar por ancho
- `perfil=55` — filtrar por perfil
- `rin=16` — filtrar por rin

#### GET Buscar por Medida — 🌍 Público
```
GET {{baseUrl}}/llantas/buscar-medida?ancho=205&perfil=55&rin=16
```
> **Obligatorios:** ancho, perfil, rin (los 3)

#### GET Buscar por Vehículo — 🌍 Público
```
GET {{baseUrl}}/llantas/buscar-vehiculo?marca=Toyota&modelo=Corolla&anio=2020
```

#### GET Detalle Llanta — 🌍 Público
```
GET {{baseUrl}}/llantas/1
```
> Cambia `1` por el ID real de la llanta. IDs válidos del seeder: `1` al `13`.

#### POST Crear Llanta — 👑 Admin
```
POST {{baseUrl}}/llantas
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```
**Body:**
```json
{
  "idMarca": 1,
  "modelo": "Primacy 4",
  "ancho": 205,
  "perfil": 55,
  "rin": 16,
  "precio": 180.50,
  "stock": 20,
  "descripcion": "Llanta de alto rendimiento para turismo"
}
```
> **Validaciones:**
> - `idMarca`: integer requerido
> - `modelo`: 2-100 caracteres
> - `ancho`: 100-400
> - `perfil`: 25-100
> - `rin`: 10-30
> - `precio`: decimal requerido
> - `stock`: entero >= 0

#### PUT Actualizar Llanta — 👑 Admin
```
PUT {{baseUrl}}/llantas/1
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```
**Body:**
```json
{
  "idMarca": 1,
  "modelo": "Primacy 4 Plus",
  "ancho": 205,
  "perfil": 55,
  "rin": 16,
  "precio": 195.00,
  "stock": 15
}
```

#### DELETE Eliminar Llanta — 👑 Admin
```
DELETE {{baseUrl}}/llantas/1
Authorization: Bearer {{adminToken}}
```

---

### 🚗 4. Vehículos (3 endpoints — Todos Públicos)

**IDs válidos de Marcas (del seeder 04):**
| ID | Marca |
|----|-------|
| 1 | Toyota |
| 2 | Chevrolet |
| 3 | Hyundai |
| 4 | Kia |
| 5 | Mazda |
| 6 | Ford |
| 7 | Nissan |
| 8 | Volkswagen |

#### GET Listar Marcas
```
GET {{baseUrl}}/vehiculos/marcas
```

#### GET Marcas con Modelos
```
GET {{baseUrl}}/vehiculos/marcas/completo
```

#### GET Modelos por Marca
```
GET {{baseUrl}}/vehiculos/marcas/1/modelos
```
> Cambia `1` por el ID de marca (1-8).

---

### 🛒 5. Carrito (5 endpoints — Auth Opcional)

> El carrito funciona con auth opcional: con JWT usa la cuenta del cliente, sin JWT funciona con `sesionId` anónimo.

#### GET Ver Carrito
```
GET {{baseUrl}}/carrito
Authorization: Bearer {{token}}  (opcional)
```
**Sin auth, pasar sesionId:**
```
GET {{baseUrl}}/carrito?sesionId=abc123
```

#### POST Agregar Item
```
POST {{baseUrl}}/carrito/agregar
Authorization: Bearer {{token}}  (opcional)
Content-Type: application/json
```
**Body:**
```json
{
  "idLlanta": 1,
  "cantidad": 2
}
```
> **Validaciones:**
> - `idLlanta`: integer requerido
> - `cantidad`: integer >= 1

#### PUT Actualizar Item
```
PUT {{baseUrl}}/carrito/actualizar/1
Authorization: Bearer {{token}}  (opcional)
Content-Type: application/json
```
**Body:**
```json
{
  "cantidad": 4
}
```

#### DELETE Eliminar Item
```
DELETE {{baseUrl}}/carrito/eliminar/1
Authorization: Bearer {{token}}  (opcional)
```

#### DELETE Vaciar Carrito
```
DELETE {{baseUrl}}/carrito/vaciar
Authorization: Bearer {{token}}  (opcional)
```

---

### 📦 6. Pedidos (4 endpoints — 🔒 JWT Requerido)

#### POST Checkout
```
POST {{baseUrl}}/pedidos/checkout
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "idDireccionEntrega": 1,
  "requiereInstalacion": false
}
```
> **Validaciones:**
> - `idDireccionEntrega`: integer requerido
> - `requiereInstalacion`: boolean opcional

#### GET Mis Pedidos
```
GET {{baseUrl}}/pedidos
Authorization: Bearer {{token}}
```

#### GET Detalle Pedido
```
GET {{baseUrl}}/pedidos/1
Authorization: Bearer {{token}}
```

#### GET Tracking Pedido
```
GET {{baseUrl}}/pedidos/1/tracking
Authorization: Bearer {{token}}
```

---

### 🏠 7. Direcciones (4 endpoints — 🔒 JWT Requerido)

#### GET Mis Direcciones
```
GET {{baseUrl}}/direcciones
Authorization: Bearer {{token}}
```

#### POST Crear Dirección
```
POST {{baseUrl}}/direcciones
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "provincia": "Pichincha",
  "ciudad": "Quito",
  "direccionCompleta": "Av. Amazonas N23-45 y Colón",
  "referencia": "Frente al parque La Carolina",
  "esPrincipal": true
}
```
> **Validaciones:**
> - `provincia`: 2-100 caracteres, requerido
> - `ciudad`: 2-100 caracteres, requerido
> - `direccionCompleta`: mínimo 5 caracteres, requerido
> - `referencia`: máx 255 caracteres, opcional
> - `esPrincipal`: boolean, opcional

#### PUT Actualizar Dirección
```
PUT {{baseUrl}}/direcciones/1
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body:**
```json
{
  "provincia": "Pichincha",
  "ciudad": "Quito",
  "direccionCompleta": "Av. 10 de Agosto N12-34",
  "referencia": "Edificio azul, piso 3",
  "esPrincipal": false
}
```

#### DELETE Eliminar Dirección
```
DELETE {{baseUrl}}/direcciones/1
Authorization: Bearer {{token}}
```

---

### 👑 8. Admin (6 endpoints — 🔒 JWT + isAdmin)

> ⚠️ **REQUIERE adminToken.** Todas las rutas usan middleware `verifyJWT + isAdmin`.

#### GET Dashboard
```
GET {{baseUrl}}/admin/dashboard
Authorization: Bearer {{adminToken}}
```

#### GET Listar Clientes
```
GET {{baseUrl}}/admin/clientes?page=1&limit=10
Authorization: Bearer {{adminToken}}
```
**Query params opcionales:** `page`, `limit`, `search`

#### GET Detalle Cliente
```
GET {{baseUrl}}/admin/clientes/1
Authorization: Bearer {{adminToken}}
```

#### PATCH Toggle Cliente Activo/Inactivo
```
PATCH {{baseUrl}}/admin/clientes/1/toggle
Authorization: Bearer {{adminToken}}
```

#### GET Listar Pedidos Admin
```
GET {{baseUrl}}/admin/pedidos?page=1
Authorization: Bearer {{adminToken}}
```
**Query params opcionales:** `page`, `estado` (PENDIENTE | CONFIRMADO | EN_PREPARACION | ENVIADO | ENTREGADO | CANCELADO)

#### PATCH Cambiar Estado Pedido
```
PATCH {{baseUrl}}/admin/pedidos/1/estado
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```
**Body:**
```json
{
  "estado": "CONFIRMADO"
}
```
**Estados válidos:** `PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `ENVIADO`, `ENTREGADO`, `CANCELADO`

---



## ✅ Flujo de Testing Recomendado

1. **Health Check** → GET `/` y `/health`
2. **Login** como usuario normal → POST `/clientes/login` (guardar `{{token}}`)
3. **Llantas públicas** → GET `/llantas`, buscar por medida, detalle
4. **Vehículos públicos** → GET `/vehiculos/marcas`, modelos
5. **Carrito** → Agregar item, ver carrito, actualizar, eliminar
6. **Direcciones** → Crear dirección (necesaria antes de checkout)
7. **Pedidos** → Checkout, listar pedidos, tracking
8. **Login como admin** → Guardar en `{{adminToken}}`
9. **Admin** → Dashboard, clientes, pedidos, cambiar estados

---

## 📊 Datos de Prueba en la DB (Seeders)

### Marcas de Llantas (Seeder 01)
Michelin, Bridgestone, Continental, Pirelli, Goodyear, Hankook

### Llantas (Seeder 02) — 13 llantas disponibles
| ID | Marca | Modelo | Medida | Precio |
|----|-------|--------|--------|--------|
| 1 | Michelin | Pilot Sport 4 | 225/45R17 | $189.99 |
| 2 | Michelin | Energy Saver+ | 205/55R16 | $145.00 |
| 3 | Michelin | Primacy 4 | 215/55R17 | $162.50 |
| 4 | Bridgestone | Turanza T005 | 205/55R16 | $138.00 |
| 5 | Bridgestone | Dueler AT | 265/70R17 | $215.00 |
| 6 | Bridgestone | Potenza RE003 | 225/45R18 | $198.00 |
| 7 | Continental | PremiumContact 6 | 225/45R17 | $175.00 |
| 8 | Continental | CrossContact ATR | 235/65R17 | $188.00 |
| 9 | Pirelli | Cinturato P7 | 225/50R17 | $165.00 |
| 10 | Pirelli | P Zero | 245/35R19 | $285.00 |
| 11 | Goodyear | Assurance WeatherReady | 215/60R16 | $142.00 |
| 12 | Hankook | Ventus Prime3 | 205/55R16 | $98.00 |
| 13 | Hankook | Dynapro AT2 | 265/75R16 | $145.00 |

### Marcas de Vehículos (Seeder 04)
Toyota (1), Chevrolet (2), Hyundai (3), Kia (4), Mazda (5), Ford (6), Nissan (7), Volkswagen (8)

### Clientes (Seeder 08)
| ID | Nombre | Email | Rol |
|----|--------|-------|-----|
| 1 | Administrador Sistema | admin@ectyre.com | admin (sin rol en DB) |
| 2 | Carlos Mendoza | carlos.mendoza@test.com | usuario |
| 3 | María Elena Torres Vega | maria.torres@test.com | usuario |
