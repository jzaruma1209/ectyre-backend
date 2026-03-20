# 📋 Changelog — ectyre-backend

Todos los cambios notables del proyecto serán documentados aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.0.0] — 2026-03-20

### Added
- 🚀 **Módulo de Pedidos**: Flujo de checkout completo, historial de órdenes, detalle de pedido y seguimiento (tracking).
- 📍 **Módulo de Direcciones**: Gestión completa de direcciones de envío para clientes.
- 🔐 **Middleware de Administración**: Implementación del middleware `isAdmin` para proteger rutas administrativas.
- 🛡️ **Panel de Administración**: Dashboard con métricas clave, gestión de clientes, productos y estados de órdenes.
- 🚗 **Módulo de Vehículos**: Catálogo público de marcas y modelos para filtrar llantas compatibles.
- 🏗️ **Infraestructura de Datos**: 8 seeders completos para poblar marcas, llantas, vehículos, métodos de pago y usuario admin.
- 🧪 **Tests de Integración**: Cobertura de pruebas para los módulos de Carrito, Cliente, Llantas y Pedidos.
- 🔒 **Hardening de Seguridad**: Configuración restrictiva de CORS y ocultación de trazas de error en producción.

### Changed
- 🛠️ Mejora en las validaciones de datos en todos los endpoints clave.
- ⚙️ Actualización del `errorHandler` para soportar distintos entornos (dev/prod).

---

## [0.2.0] — 2026-02-15

### Added
- 🔐 **Autenticación JWT**: Registro de clientes, inicio de sesión y protección de rutas.
- 👤 **Gestión de Usuarios**: Actualización de perfil y control de acceso.
- 🛞 **Catálogo de Llantas**: Endpoints para listar, buscar por medida y compatibilidad básica.
- 🛒 **Carrito de Compras**: Implementación del flujo de agregar, editar y eliminar ítems.

---

## [0.1.0] — 2025-11-24

### Added
- 🎉 Estructura base del proyecto con Express.js y Sequelize.
- ⚙️ Configuración de conexión a PostgreSQL.
- 🗺️ Router principal en `src/routes/index.js`.
- 🔧 Archivo `app.js` con middlewares base (CORS, JSON parser).
- 🚀 Servidor en `src/server.js`.
- 📁 Directorio `src/utils/` para utilidades compartidas.
- 📋 Archivo `.env.example` con variables de entorno requeridas.
