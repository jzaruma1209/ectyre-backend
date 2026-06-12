<div align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,100:48CAE4&height=160&section=header&text=Ectyre%20Backend%20API&fontSize=45&fontColor=ffffff&fontAlignY=45&desc=REST%20API%20·%20Node.js%20·%20Express%20·%20PostgreSQL&descAlignY=68&descSize=16&animation=fadeIn" alt="header"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sequelize-6.37-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Secure-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white"/>
  <img src="https://img.shields.io/badge/Cloudinary-Integrado-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>
</p>

---

## 📖 Acerca del Proyecto

**Ectyre Backend** es la API REST principal y el motor de datos para el ecosistema de **Ectyre**, una plataforma moderna de e-commerce y servicios enfocada en la venta de llantas y accesorios automotrices. 

Construida con una arquitectura modular, segura y altamente escalable, esta API provee todos los servicios necesarios para clientes finales (B2C) y administradores del sistema, manejando desde la exploración del catálogo hasta el procesamiento de pagos y gestión de pedidos.

---

## ✨ Funcionalidades Implementadas

Actualmente, el sistema cuenta con los siguientes módulos completamente funcionales:

### 👤 Gestión de Usuarios y Autenticación
- Registro seguro de clientes con encriptación de contraseñas (`bcrypt`).
- Inicio de sesión y generación de Tokens de Acceso Seguros (`JWT`).
- Gestión del perfil del cliente (ver y actualizar datos personales).
- Gestión de libreta de direcciones para envíos (múltiples direcciones por cliente).

### 🛒 Catálogo y Productos (Llantas y Vehículos)
- Exploración de catálogo completo de llantas con imágenes.
- Búsqueda y filtrado avanzado (por medidas: ancho, perfil, rin).
- Búsqueda por compatibilidad transversal de vehículos.
- Listado unificado de marcas y modelos de vehículos.

### 🛍️ Carrito de Compras
- Agregar, actualizar cantidades y eliminar productos del carrito.
- Persistencia del carrito en base de datos para recuperar sesiones.
- Vaciado sistemático tras completar una compra.

### 📦 Checkout y Pedidos
- Proceso de "Checkout" para transformar un carrito en un pedido en firme.
- Asignación de dirección de entrega y método de pago.
- Seguimiento de estado de pedidos (`Pendiente`, `Pagado`, `Enviado`, `Entregado`, `Cancelado`).
- Historial detallado de pedidos por cliente.

### 🛡️ Panel de Administración (Backoffice)
- Dashboard con métricas clave del negocio.
- Gestión completa (CRUD) de inventario de llantas.
- Gestión y actualización de estados de los pedidos de clientes.
- Interfaz para visualización de información de clientes.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza un stack moderno basado en JavaScript/TypeScript para el entorno de ejecución Node.js:

- **Entorno de Ejecución:** Node.js (v20.x o superior)
- **Framework Web:** Express.js 4 (Rápido, minimalista)
- **Base de Datos:** PostgreSQL (Relacional, robusta, transaccional)
- **ORM:** Sequelize 6 + Sequelize CLI (Mapeo objeto-relacional y migraciones)
- **Seguridad:** 
  - `Helmet` (Cabeceras HTTP seguras)
  - `Cors` (Intercambio de recursos de origen cruzado)
  - `express-rate-limit` (Protección contra fuerza bruta y DDoS)
  - `bcrypt` (Hashing de passwords)
- **Autenticación:** JWT (jsonwebtoken) + Google OAuth 2.0 (Passport.js)
- **Validaciones:** `express-validator` (Sanitización y validación de inputs)
- **Almacenamiento de Imágenes:** Cloudinary via `multer-storage-cloudinary`
- **Subida de Archivos:** `multer` (multipart/form-data)
- **Testing:** Jest + Supertest (Pruebas de integración automáticas)

---

## 📋 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalado:

- **Node.js**: v20.0.0 o superior.
- **npm**: v10.0.0 o superior.
- **PostgreSQL**: v13.0 o superior.
- **Git**: Para clonar y manejar el repositorio.
- **Puerto**: El servidor corre en `8080` (configurable via `PORT` en `.env`).

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone https://github.com/jzaruma1209/ectyre-backend.git
cd ectyre-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea tu archivo `.env` basado en el archivo de ejemplo proporcionado:
```bash
cp .env.example .env
```
Abre el archivo `.env` y ajusta las credenciales:
```env
PORT=8080
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ectyre_db
DB_USER=postgres
DB_PASS=tu_password_aqui

# Seguridad JWT
TOKEN_SECRET=tu_mega_secreta_clave_jwt_que_nadie_sabe
TOKEN_EXPIRES_IN=7d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
SESSION_SECRET=una_cadena_aleatoria_segura
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS (orígenes adicionales separados por coma)
CORS_ORIGIN=https://ectyre.com
```

### 4. Configurar la Base de Datos
Crea la base de datos, ejecuta las migraciones (esquema) y siembra los datos iniciales de prueba (seeders):
```bash
# Crear base de datos
npm run db:create

# Ejecutar migraciones (Crear tablas)
npm run db:migrate

# Opcional pero recomendado: Cargar datos iniciales (Marcas, modelos, llantas, admin)
npm run db:seed
```

### 5. Iniciar el servidor
Para desarrollo (incluye hot-reload con Nodemon al guardar cambios):
```bash
npm run dev
```
Para producción:
```bash
npm start
```
Si todo salió bien, verás en la consola: `🚀 Servidor corriendo en el puerto 8080`.

---

## 🚦 Scripts Disponibles (`package.json`)

- `npm run dev` — Servidor de desarrollo con `nodemon` (hot-reload).
- `npm start` — Servidor de producción (ejecuta migraciones automáticas en Vercel via `prestart`).
- `npm test` — Suite completa: `pretest` (reset migraciones BD test) → `jest --detectOpenHandles`.
- `npm run test:watch` — Jest en modo observador.
- `npm run db:create` — Crear BD con Sequelize CLI.
- `npm run db:migrate` — Ejecutar migraciones pendientes.
- `npm run db:migrate:prod` — Migraciones en producción (`NODE_ENV=production`).
- `npm run db:seed` — Poblar BD con datos iniciales (8 seeders).
- `npm run db:seed:prod` — Seeders en producción.
- `npm run reset:migrate` — Revertir y re-ejecutar todas las migraciones.

---

## 🏛️ Estructura del Proyecto

El proyecto sigue una arquitectura MVC fluida y modular bajo el directorio `src/`:

```text
src/
├── config/         # 3 archivos — DB, Cloudinary, Passport (Google OAuth)
├── controllers/    # 8 controladores (admin, carrito, cliente, direccion, imagen, llanta, pedido, vehiculo)
├── middlewares/    # 5 middlewares (auth, rateLimit, upload, validation, index barrel)
├── migrations/     # 16 migraciones (15 tablas + 1 alter column googleId)
├── models/         # 15 modelos Sequelize (incl. index.js con asociaciones)
├── routes/         # 10 routers (index + auth, admin, carrito, cliente, direccion, imagen, llanta, pedido, vehiculo)
├── seeders/        # 8 seeders (marcas, llantas, imagenes, vehiculos, compatibilidades, metodos pago, clientes)
├── services/       # 8 servicios (business logic, clases singleton)
├── tests/          # 5 archivos (carrito, cliente, llanta, pedido + testMigrate helper)
├── utils/          # 4 utilidades (catchError, connection, customErrors, errorHandler)
├── app.js          # Configuración principal y middlewares de Express
└── server.js       # Entry point principal (Arranque del servidor http)
```

---

## 📚 Documentación y Guías de Integración

Para facilitar el trabajo a los desarrolladores, hemos preparado documentación específica:

| Documento | Propósito |
|-----------|-----------|
| 📖 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Documentación técnica detallada de todos los endpoints |
| 🧪 [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) | Guía completa para testing con Postman |
| 🤖 [AGENTS.md](./AGENTS.md) | Instrucciones para agentes de IA (convenciones, estructura, comandos) |
| 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) | Guía de despliegue a producción |
| 📋 [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios del proyecto |

También puedes importar la colección integral de pruebas en tu entorno:
- 🚀 **[Colección de Postman (.json)](./Ectyre_API_Postman_Collection.json)** (Fuente definitiva de la verdad — payloads, métodos y flujos completos).

---

## 🔗 Endpoints Principales (API v1)

La base de la API está en `/api/v1`. Para consumir endpoints protegidos, se debe enviar el header: `Authorization: Bearer <TOKEN>`.

### 🌍 Públicos
- `GET /` - Health check / bienvenida con lista de endpoints.
- `GET /health` - Estado del servidor (`{ success, status, timestamp }`).
- `GET /api/v1/auth/google` - Iniciar sesión con Google OAuth 2.0.
- `GET /api/v1/auth/google/callback` - Callback de Google OAuth.
- `GET /api/v1/llantas` - Catálogo completo (paginación y filtros: `?page=&marca=&ancho=&perfil=&rin=&destacado=`).
- `GET /api/v1/llantas/buscar-medida` - Búsqueda por medida (`?ancho=&perfil=&rin=`).
- `GET /api/v1/llantas/buscar-vehiculo` - Búsqueda por vehículo (`?marca=&modelo=&anio=`).
- `GET /api/v1/llantas/buscar-general` - Búsqueda por texto libre (barra de búsqueda).
- `GET /api/v1/llantas/recomendaciones` - Recomendaciones por rin.
- `GET /api/v1/llantas/:id` - Detalle de llanta por ID.
- `GET /api/v1/vehiculos/marcas` - Listar marcas de vehículos activas.
- `GET /api/v1/vehiculos/marcas/completo` - Marcas con modelos anidados.
- `GET /api/v1/vehiculos/marcas/:idMarca/modelos` - Modelos de una marca específica.

### 🔒 Clientes (Requieren Autenticación JWT)
- `POST /api/v1/clientes/registro` - Registrar nuevo cliente (rate limit: 3/h).
- `POST /api/v1/clientes/login` - Iniciar sesión (rate limit: 5/15min).
- `POST /api/v1/clientes/logout` - Cerrar sesión.
- `GET /api/v1/clientes/perfil` - Obtener datos del perfil propio.
- `PUT /api/v1/clientes/perfil` - Actualizar datos del perfil propio.

### 🛒 Carrito (Auth Opcional — JWT o sesión anónima)
- `GET /api/v1/carrito` - Ver contenido del carrito.
- `POST /api/v1/carrito/agregar` - Agregar ítem al carrito.
- `PUT /api/v1/carrito/actualizar/:id` - Actualizar cantidad de un ítem.
- `DELETE /api/v1/carrito/eliminar/:id` - Eliminar ítem del carrito.
- `DELETE /api/v1/carrito/vaciar` - Vaciar carrito completo.

### 📦 Pedidos (Requieren Autenticación JWT)
- `POST /api/v1/pedidos/checkout` - Procesar la compra del carrito actual.
- `GET /api/v1/pedidos` - Historial de pedidos del cliente.
- `GET /api/v1/pedidos/:id` - Detalle de un pedido específico.
- `GET /api/v1/pedidos/:id/tracking` - Tracking del estado de envío.

### 🏠 Direcciones (Requieren Autenticación JWT)
- `GET /api/v1/direcciones` - Listar direcciones del cliente.
- `POST /api/v1/direcciones` - Crear nueva dirección de entrega.
- `PUT /api/v1/direcciones/:id` - Actualizar una dirección.
- `DELETE /api/v1/direcciones/:id` - Eliminar una dirección.

### 🛡️ Administradores (Requiere JWT + Rol Admin)
- `GET /api/v1/admin/dashboard` - Métricas del sistema.
- `GET /api/v1/admin/clientes` - Listar clientes (`?page=&limit=&search=`).
- `GET /api/v1/admin/clientes/:id` - Detalle de un cliente.
- `GET /api/v1/admin/clientes/:id/pedidos` - Pedidos de un cliente.
- `PATCH /api/v1/admin/clientes/:id/toggle` - Activar/desactivar cliente.
- `GET /api/v1/admin/pedidos` - Listar todos los pedidos (`?page=&estado=`).
- `GET /api/v1/admin/pedidos/:id` - Detalle de un pedido.
- `PATCH /api/v1/admin/pedidos/:id/estado` - Cambiar estado del pedido.
- `PATCH /api/v1/admin/llantas/:id/stock` - Actualizar stock de una llanta.
- `POST /api/v1/admin/llantas` - Crear llanta (JSON o `multipart/form-data` con imagen).
- `POST /api/v1/admin/llantas/:id/imagenes` - Subir 1 imagen a una llanta.
- `POST /api/v1/admin/llantas/:id/imagenes/multiple` - Subir múltiples imágenes a una llanta.
- `GET /api/v1/admin/llantas/:id/imagenes` - Ver imágenes de una llanta.
- `PATCH /api/v1/admin/llantas/:id/imagenes/:idImagen/principal` - Establecer imagen principal.
- `DELETE /api/v1/admin/imagenes/:idImagen` - Eliminar una imagen.
- `GET /api/v1/admin/reportes/ventas` - Reporte de ventas (`?desde=&hasta=`).
- `GET /api/v1/admin/reportes/productos-top` - Top productos más vendidos.
- `GET /api/v1/admin/stats/carritos` - Estadísticas de carritos actuales.

*(Para ver la documentación técnica detallada de cada endpoint, puedes observar e importar el archivo Postman adjunto en el proyecto).*

---

## 🧪 Pruebas y Calidad (Testing)

El sistema cuenta con una robusta suite de pruebas de integración usando **Jest** y **Supertest**.
El comando `pretest` ejecuta `reset:migrate` (revierte y re-ejecuta todas las migraciones en la BD de test), luego Jest corre todos los tests.

```bash
npm test
```

Módulos testeados actualmente: Clientes, Llantas, Carrito de Compras, Pedidos (5 archivos de test).

La integración continua vía **GitHub Actions** (`.github/workflows/ci.yml`) verifica en cada push/PR a `main`/`develop` que el servidor cargue correctamente con `node -e "require('./src/app.js')"`.

---

## 🤝 Contribuciones

Si deseas colaborar con el código:
1. Asegúrate de tener el código actualizado (`git pull`).
2. Crea una rama descriptiva para tu feature (`git checkout -b feature/mi-nueva-caracteristica`).
3. Realiza tus commits de manera atómica y descriptiva.
4. Haz push a la rama y abre un **Pull Request**.

Lee el archivo de contribución para más detalles sobre estándares de código.

---

<div align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:48CAE4,100:6C63FF&height=80&section=footer" alt="footer"/>
  <p>© 2026 Ectyre Team — Todos los derechos reservados.</p>
</div>
