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
- **Validaciones:** `express-validator` (Sanitización y validación de inputs)
- **Testing:** Jest + Supertest (Pruebas unitarias y de integración automáticas)

---

## 📋 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalado:

- **Node.js**: v20.0.0 o superior.
- **npm**: v10.0.0 o superior (usualmente viene con Node).
- **PostgreSQL**: v13.0 o superior funcionando localmente o un clúster en la nube.
- **Git**: Para clonar y manejar el repositorio.

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
Abre el archivo `.env` y ajusta las credenciales (especialmente las de tu base de datos local):
```env
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ectyre_db
DB_USER=postgres
DB_PASS=tu_password_aqui

# Seguridad JWT
TOKEN_SECRET=tu_mega_secreta_clave_jwt_que_nadie_sabe
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
Si todo salió bien, verás en la consola: `🚀 Servidor corriendo en el puerto 3000`.

---

## 🚦 Scripts Disponibles (`package.json`)

- `npm run dev`: Inicia el servidor de desarrollo con `nodemon`.
- `npm start`: Inicia el servidor de producción.
- `npm test`: Ejecuta toda la suite de pruebas unitarias y de integración con Jest.
- `npm run test:watch`: Ejecuta las pruebas en modo observador.
- `npm run db:create`, `db:migrate`, `db:seed`: Scripts para gestionar la base de datos con Sequelize CLI.

---

## 🏛️ Estructura del Proyecto

El proyecto sigue una arquitectura MVC fluida y modular bajo el directorio `src/`:

```text
src/
├── config/         # Configuraciones de BD y variables globales
├── controllers/    # Controladores (Manejo de Requests y Responses)
├── middlewares/    # Middlewares de Express (Auth, Roles, Validaciones)
├── migrations/     # Scripts de Sequelize para crear/modificar tablas
├── models/         # Definición de modelos de datos Sequelize
├── routes/         # Definición de Rutas API (Endpoints)
├── seeders/        # Datos predefinidos para poblar la base de datos
├── services/       # Lógica de Negocio y comunicación con BD
├── tests/          # Suite de testing (Jest/Supertest)
├── utils/          # Funciones utilitarias (Manejo de errores, helpers)
├── app.js          # Configuración principal y middlewares de Express
└── server.js       # Entry point principal (Arranque del servidor http)
```

---

## 🔗 Endpoints Principales (API v1)

La base de la API está en `/api/v1`. Para consumir endpoints protegidos, se debe enviar el header: `Authorization: Bearer <TOKEN>`.

### 🌍 Públicos
- `GET /` - Health check.
- `GET /api/v1/llantas` - Obtener catálogo de llantas.
- `GET /api/v1/vehiculos/marcas` - Obtener marcas de vehículos.

### 🔒 Clientes (Requieren Autenticación)
- `POST /api/v1/clientes/registro` - Registrar nuevo cliente.
- `POST /api/v1/clientes/login` - Autenticarse e iniciar sesión.
- `GET /api/v1/clientes/perfil` - Obtener datos del perfil propio.
- `GET /api/v1/carrito` - Obtener carrito actual.
- `POST /api/v1/pedidos/checkout` - Procesar la compra del carrito actual.
- `GET /api/v1/pedidos` - Ver historial de mis pedidos.

### 🛡️ Administradores (Requiere Rol Admin)
- `GET /api/v1/admin/dashboard` - Obtener analíticas del sistema.
- `POST /api/v1/admin/llantas` - Crear un producto en inventario.
- `PUT /api/v1/admin/pedidos/:id/status` - Actualizar el estado logístico de un pedido.

*(Para ver la documentación técnica detallada de cada endpoint, puedes observar e importar el archivo Postman adjunto en el proyecto).*

---

## 🧪 Pruebas y Calidad (Testing)

El sistema cuenta con una robusta suite de pruebas end-to-end e integración usando **Jest** y **Supertest**. 
Al correr las pruebas, se crea automáticamente una base de datos temporal, ejecuta migraciones, corre todos los tests y luego se limpia la información.

```bash
npm test
```

Módulos testeados actualmente: Auth, Clientes, Catálogo, Llantas, Carrito de Compras, Pedidos.

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
