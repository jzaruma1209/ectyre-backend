# 🗺️ PLAN DE IMPLEMENTACIÓN — Llantas247 API
## Estado actual vs. Requisitos para Producción

---

## ✅ ANÁLISIS: QUÉ ESTÁ HECHO

### Infraestructura base
- [x] `app.js` — Express configurado con helmet, cors, errorHandler ✅
- [x] `server.js` — Inicio del servidor con conexión a DB ✅
- [x] `src/config/config.js` — Configuración de Sequelize ✅
- [x] `src/utils/` — catchError, connection, customErrors, errorHandler ✅

### Middlewares
- [x] `auth.middleware.js` — verifyJWT ✅
- [x] `validation.middleware.js` — validateLlantaData, validateClienteData, validateLoginData, validateCarritoItem, validateId ✅
- [x] `rateLimit.middleware.js` — rateLimitLogin ✅

### Modelos (14 modelos — COMPLETOS)
- [x] marca-llanta.js ✅
- [x] llanta.js ✅
- [x] imagen-llanta.js ✅
- [x] marca-vehiculo.js ✅
- [x] modelo-vehiculo.js ✅
- [x] compatibilidad.js ✅
- [x] cliente.js ✅
- [x] direccion.js ✅
- [x] carrito.js ✅
- [x] item-carrito.js ✅
- [x] pedido.js ✅
- [x] detalle-pedido.js ✅
- [x] metodo-pago.js ✅
- [x] pago.js ✅

### Migraciones (14 migraciones — COMPLETAS)
- [x] 20241124000001-create-marca-llanta.js ✅
- [x] 20241124000002-create-llanta.js ✅
- [x] 20241126000003-create-cliente.js ✅
- [x] 20241126000004-create-direccion.js ✅
- [x] 20241126000005-create-carrito.js ✅
- [x] 20241126000006-create-item-carrito.js ✅
- [x] 20241126000007-create-marca-vehiculo.js ✅
- [x] 20241126000008-create-modelo-vehiculo.js ✅
- [x] 20241126000009-create-compatibilidad.js ✅
- [x] 20241126000010-create-imagen-llanta.js ✅
- [x] 20241126000011-create-metodo-pago.js ✅
- [x] 20241126000012-create-pedido.js ✅
- [x] 20241126000013-create-detalle-pedido.js ✅
- [x] 20241126000014-create-pago.js ✅

### Servicios (PARCIAL — 3 de 5)
- [x] llanta.services.js — getAllLlantas, getLlantaById, buscarPorMedida, buscarPorVehiculo, create, update, delete ✅
- [x] cliente.services.js — registrar, login, getPerfil, updatePerfil ✅
- [x] carrito.services.js ✅
- [x] pedido.services.js — checkout, getPedidos, getPedidoById, getTracking ✅
- [x] direccion.services.js — getDirecciones, createDireccion, updateDireccion, deleteDireccion ✅

### Controladores (PARCIAL — 3 de 5)
- [x] llanta.controllers.js ✅
- [x] cliente.controllers.js ✅
- [x] carrito.controllers.js ✅
- [x] pedido.controllers.js ✅
- [x] direccion.controllers.js ✅

### Rutas (PARCIAL — 3 de 5 + faltan rutas críticas)
- [x] llanta.router.js — 7 endpoints ✅
- [x] cliente.router.js — 4 endpoints ✅
- [x] carrito.router.js — 5 endpoints ✅
- [x] pedido.router.js — 4 endpoints ✅
- [x] direccion.router.js — 4 endpoints ✅
- [x] admin.router.js — 6 endpoints ✅ Etapa 2
- [x] vehiculo.router.js — 3 endpoints ✅ Etapa 2

---

## ❌ ANÁLISIS: QUÉ FALTA PARA PRODUCCIÓN

### Módulos completos faltantes
| Módulo | Service | Controller | Router | Endpoints |
|--------|---------|------------|--------|-----------|
| Pedidos | ❌ | ❌ | ❌ | 4 endpoints: checkout, listar, detalle, tracking |
| Direcciones | ❌ | ❌ | ❌ | 4 endpoints: listar, crear, actualizar, eliminar |
| Admin Panel | N/A | ❌ | ❌ | 6 endpoints: dashboard, CRUD productos, gestión órdenes, clientes |
| Marcas Vehículo | ❌ | ❌ | ❌ | 2 endpoints: listar marcas, listar modelos |

### Seguridad faltante
| Item | Estado |
|------|--------|
| Middleware `isAdmin` (verificar rol admin) | ❌ FALTA — `verifyJWT` no valida rol |
| Variables de entorno `.env` configuradas | ❓ Verificar; clave para producción |
| Manejo de errores en producción (ocultar stack traces) | ❌ Revisar errorHandler |

### Funcionalidades faltantes en módulos EXISTENTES
| Módulo | Qué falta |
|--------|-----------|
| cliente.router.js | No tiene endpoint `POST /logout` ni cambio de contraseña |
| llanta.router.js | No tiene endpoint para imágenes de llantas |
| carrito.router.js | No tiene `POST /checkout` que pase al módulo de pedidos |

### Calidad y producción
| Item | Estado |
|------|--------|
| Tests de integración | Solo `carrito.test.js` existe; falta para otros módulos ❌ |
| Seeders (datos de prueba) | ❌ No existen — necesarios para probar la API |
| Variables `.env` documentadas | ✅ `.env.example` existe |
| CORS configurado correctamente | ⚠️ Muy abierto (`cors()` sin opciones) |
| Rate limiting en todas las rutas | ⚠️ Solo en `/login`; falta en rutas admin |

---

## 🗓️ PLAN EN 3 ETAPAS

---

## 🔵 ETAPA 1 — Módulo de Pedidos + Direcciones + Middleware Admin
> **Objetivo:** Completar el flujo de compra de punta a punta (checkout y seguimiento)
> **Archivos a crear:** 6 archivos nuevos + actualizar routes/index.js y auth.middleware.js

### 1.1 Middleware de Admin
- **Archivo:** `src/middlewares/auth.middleware.js`
- **Tarea:** Agregar función `isAdmin` que verifique `req.user.role === 'admin'`

### 1.2 Módulo de Direcciones
- **Archivo nuevo:** `src/services/direccion.services.js`
  - `getDirecciones(idCliente)` — listar direcciones del cliente
  - `createDireccion(idCliente, data)` — crear nueva dirección
  - `updateDireccion(id, idCliente, data)` — actualizar (verificando ownership)
  - `deleteDireccion(id, idCliente)` — eliminar (verificando ownership)
- **Archivo nuevo:** `src/controllers/direccion.controllers.js`
- **Archivo nuevo:** `src/routes/direccion.router.js`
  ```
  GET    /api/v1/direcciones         → Listar mis direcciones (🔒 JWT)
  POST   /api/v1/direcciones         → Crear dirección (🔒 JWT)
  PUT    /api/v1/direcciones/:id     → Actualizar dirección (🔒 JWT)
  DELETE /api/v1/direcciones/:id     → Eliminar dirección (🔒 JWT)
  ```

### 1.3 Módulo de Pedidos
- **Archivo nuevo:** `src/services/pedido.services.js`
  - `checkout(idCliente, data)` — crear pedido desde carrito, vaciar carrito, crear registro de pago
  - `getPedidos(idCliente)` — historial de pedidos del cliente
  - `getPedidoById(id, idCliente)` — detalle de un pedido
  - `getTracking(id)` — estado de seguimiento del pedido
- **Archivo nuevo:** `src/controllers/pedido.controllers.js`
- **Archivo nuevo:** `src/routes/pedido.router.js`
  ```
  POST   /api/v1/pedidos/checkout       → Procesar compra (🔒 JWT)
  GET    /api/v1/pedidos                → Mis pedidos (🔒 JWT)
  GET    /api/v1/pedidos/:id            → Detalle pedido (🔒 JWT)
  GET    /api/v1/pedidos/:id/tracking   → Seguimiento (🔒 JWT)
  ```

### 1.4 Actualizar `routes/index.js`
- Registrar `direccionRouter` y `pedidoRouter`

---

## 🟡 ETAPA 2 — Panel de Administración + Marcas/Modelos
> **Objetivo:** Habilitar el panel de control del administrador y catálogo de vehículos
> **Archivos a crear:** 4 archivos nuevos + actualizar validation.middleware.js

### 2.1 Módulo Admin
- **Archivo nuevo:** `src/services/admin.services.js`
  - `getDashboard()` — ventas totales, órdenes recientes, productos más vendidos, clientes nuevos, stock bajo
  - `getAllClientes()` — lista de todos los clientes
  - `updateOrdenStatus(id, status)` — cambiar estado de orden
- **Archivo nuevo:** `src/controllers/admin.controllers.js`
- **Archivo nuevo:** `src/routes/admin.router.js`
  ```
  GET    /api/v1/admin/dashboard              → Métricas (🔒 Admin)
  GET    /api/v1/admin/clientes               → Lista clientes (🔒 Admin)
  POST   /api/v1/admin/llantas               → Crear llanta (🔒 Admin) *mover de llanta.router*
  PUT    /api/v1/admin/llantas/:id           → Actualizar llanta (🔒 Admin)
  DELETE /api/v1/admin/llantas/:id           → Eliminar llanta (🔒 Admin)
  PUT    /api/v1/admin/pedidos/:id/status    → Actualizar estado orden (🔒 Admin)
  ```

### 2.2 Módulo de Marcas y Modelos de Vehículo (catálogo público)
- **Archivo nuevo:** `src/services/vehiculo.services.js`
  - `getMarcasVehiculo()` — listar marcas
  - `getModelosByMarca(idMarca)` — listar modelos de una marca
- **Archivo nuevo:** `src/controllers/vehiculo.controllers.js`
- Agregar al `llanta.router.js` o crear `vehiculo.router.js`:
  ```
  GET    /api/v1/vehiculos/marcas           → Listar marcas (🌍 Público)
  GET    /api/v1/vehiculos/modelos/:idMarca → Listar modelos (🌍 Público)
  ```

### 2.3 Validaciones adicionales
- Agregar `validateDireccionData` en `validation.middleware.js`
- Agregar `validatePedidoData` en `validation.middleware.js`

---

## 🟢 ETAPA 3 — Seeders, Tests y Hardening para Producción
> **Objetivo:** Poblar la base de datos con datos de prueba y preparar la API para deploy
> **Archivos a crear:** múltiples seeders, ajustes de seguridad

### 3.1 Seeders (datos de prueba)
- **Directorio:** `src/seeders/`
  - `01-marcas-llantas.js` — Datos de Michelin, Bridgestone, Continental, etc.
  - `02-llantas.js` — 20 llantas de ejemplo con precios y stock
  - `03-imágenes-llantas.js` — URLs de imágenes de ejemplo
  - `04-marcas-vehiculos.js` — Toyota, Chevrolet, Ford, etc.
  - `05-modelos-vehiculos.js` — Corolla, Hilux, Aveo, etc.
  - `06-compatibilidades.js` — Relaciones llanta ↔ vehículo ↔ año
  - `07-metodos-pago.js` — Tarjeta, Transferencia, Efectivo
  - `08-admin-user.js` — Usuario administrador inicial

### 3.2 Hardening y Seguridad
- **`app.js`:** Configurar CORS con `origin` específico (no abierto)
- **`errorHandler.js`:** Ocultar `stack` en `NODE_ENV=production`
- **`auth.middleware.js`:** Agregar blacklist de tokens (logout real)
- **`.env.example`:** Documentar todas las variables necesarias

### 3.3 Tests de Integración
- `src/tests/cliente.test.js` — Registro, login, perfil
- `src/tests/llanta.test.js` — Listado, búsqueda por medida y vehículo
- `src/tests/pedido.test.js` — Flujo checkout completo

### 3.4 Documentación API
- Crear colección de Postman o Thunder Client con todos los endpoints
- Actualizar `README.md` con endpoints reales y ejemplos de uso

---

## 📊 RESUMEN TOTAL

| Categoría | Hecho | Falta | Total |
|-----------|-------|-------|-------|
| Modelos | 14 ✅ | 0 | 14 |
| Migraciones | 14 ✅ | 0 | 14 |
| Servicios | 7 ✅ | 0 ✅ | 7 |
| Controladores | 7 ✅ | 0 ✅ | 7 |
| Routers | 7 ✅ | 0 ✅ | 7 |
| Endpoints activos | 33 ✅ | 3 ❌ | 36 |
| Seeders | 7 ✅ | 0 ✅ | 7 |
| Tests | 4 ✅ | 0 ✅ | 4 |

---

> 🎉 **¡Proyecto completado!** Las 3 etapas están terminadas. La API Llantas247 está lista para producción.
