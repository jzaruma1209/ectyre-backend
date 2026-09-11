# 📋 Changelog — ectyre-backend

Todos los cambios notables del proyecto serán documentados aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [1.2.0] — 2026-09-11 — Arquitectura del sistema de productos

### Added
- 🧱 **Niveles de Inventario** en `/api/v1/catalogos`: tipos de producto (con bandera `requiereModeloMedidas`),
  marcas (logo + banner obligatorios en tipos con modelo/medidas), modelos (ligados a marca), tipos de uso,
  medidas `anchos | altos | aros` (`/medidas/:tipo`, `/medidas/:tipo/lote`) y especificaciones técnicas
  (con los tipos de producto donde aplican). Consolidado: `GET /catalogos/niveles`.
- 📦 **Productos admin** en `/api/v1/admin/productos` (JWT + admin): listar, detalle, crear/editar en una sola
  petición multipart (`datos` JSON + hasta 5 `imagenes`), activar/desactivar y borrado lógico.
- 🛡️ **10 reglas de negocio validadas en backend** (modelo/medidas condicionales, modelo de la marca, máx 5 fotos,
  foto principal automática, precio anterior > precio, oferta exige precio anterior, especificaciones por tipo,
  marca existente, precio > 0, stock 0 = no disponible) + CHECK constraints en la BD.
- 🌍 **Catálogo público** en `/api/v1/productos` (listado, detalle, buscar-medida, buscar-vehiculo, buscar-general,
  recomendaciones) con el contrato de datos del card (marca, modelo, medida legible, descuento, disponibilidad,
  especificaciones con ícono y valor, fotos, flags).

### Changed
- 🗄️ Migración `20260911000001-arquitectura-productos` (transaccional, migra datos existentes):
  `familias → tipos_producto`, `tipos_llanta → tipos_uso`, `marcas_llantas → marcas`, `modelos_llantas → modelos`,
  `productos` referencia tipo/marca/modelo directamente, `precio_oferta` → `precio_anterior` (semántica invertida),
  `compatibilidad.id_llanta → id_producto`, `imagenes_productos.public_id`.
- 🔒 `POST /productos` ya no es público (antes no pedía token). Imágenes y compatibilidad ahora exigen rol admin.
- 🖼️ Endpoints de imágenes respetan el límite de 5 y reasignan la principal al borrar.
- 🛒 Carrito, pedidos, dashboard y reportes usan la nueva estructura (sin `llantas`).
- `/api/v1/llantas` queda como alias **deprecado** de solo lectura de `/productos`.

### Removed
- Tablas `llantas`, `imagenes_llantas`, `indices_carga`, `indices_velocidad`, `temperaturas`, `sentidos_rotacion`,
  `lineas`, `procedencias` y la tabla genérica `marcas` (fusionada).
- Endpoints `/catalogos/familias`, `/procedencias`, `/lineas`, `/marcas-llanta`, `/tipos-llanta`, `/categorias`,
  `POST/PUT/DELETE /llantas`.

### Fixed
- Detalle de pedido del admin pedía columnas de dirección inexistentes (`calle`, `numeracion`).
- Migración `20260910-add-imagen-url-to-marcas` fallaba en bases nuevas (se ejecutaba antes de crear la tabla).

---

## [1.1.0] — 2026-06-25

### Added
- 📋 **Módulo de Catálogos**: CRUD completo para modelos de llanta, índices de carga, índices de velocidad, temperaturas, tipos de llanta y sentidos de rotación en `/api/v1/catalogos`. Incluye endpoint consolidado para selects de administración.
- 🔗 **Módulo de Compatibilidad**: Relación bidireccional entre vehículos y llantas en `/api/v1/compatibilidad` con endpoints públicos de consulta por vehículo y por llanta, más CRUD administrativo protegido.
- 🏷️ **Módulo de Promociones**: Gestión completa de banners promocionales en `/api/v1/admin/promociones`, con subida de imágenes a Cloudinary, toggle de estado activo/inactivo y consulta pública.
- 🖼️ **Gestión Avanzada de Imágenes**: Endpoints en `/api/v1/admin/productos/:id/imagenes` para subida individual, múltiple (hasta 5 imágenes), marcado de imagen principal y eliminación en Cloudinary y base de datos.

### Changed
- 🔄 **Colección Postman y Guía de Testing**: Actualizadas a v1.1.0 con **86 endpoints reales** documentados, verificados y testeados con tests scripts automáticos.
- 📝 **Documentación de API**: Sincronización completa de `API_DOCUMENTATION.md` y `POSTMAN_TESTING_GUIDE.md` con todos los módulos y tablas de resumen actualizadas.

---

## [1.0.2] — 2026-05-30

### Added
- ☁️ **Integración Cloudinary**: Subida de imágenes para llantas desde el panel admin. Endpoint `POST /api/v1/admin/llantas` ahora acepta `multipart/form-data` con campo `imagen`.
- 🖼️ **Endpoint imagen llanta**: El endpoint `PUT /api/v1/admin/llantas/:id` también acepta actualización de imagen.
- 📋 **Campo imagen_url**: El modelo Llanta guarda automáticamente la URL pública de Cloudinary.

### Changed
- 🔄 **Colección Postman**: Actualizada a v1.0.2 con 43 endpoints documentados.
- 👤 **Registro de clientes**: El payload ahora incluye `tipoIdentificacion`, `numeroIdentificacion`, `nombres`, `apellidos` (en lugar de un campo `nombre` genérico).

---

## [1.0.1] — 2026-03-23

### Fixed
- 🐛 **Módulo de Login**: El JWT ahora incluye de forma correcta el campo `role` para evitar accesos denegados erróneamente con administradores y proteger las demás rutas con `isAdmin`.
- 🐛 **Inconsistencias Endpoints**: Corrección de campos en los Requests (ej: `idLlanta`, `idDireccionEntrega`, parámetros correctos) para alinearlos con Postman y los modelos correspondientes de la BD.

### Doc
- 📝 **Documentación**: README.md refactorizado, con un overview real, stack actualizado y nueva documentación alineada entre la colección de Postman y la API REST.

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
