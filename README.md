<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,100:48CAE4&height=160&section=header&text=ectyre-backend&fontSize=45&fontColor=ffffff&fontAlignY=45&desc=REST%20API%20·%20Node.js%20·%20Express%20·%20PostgreSQL&descAlignY=68&descSize=16&animation=fadeIn" alt="header"/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white"/>
</p>

---

## 📖 Descripción

**Ectyre Backend** es la API REST del marketplace de llantas y servicios automotrices **Ectyre**. Construida con una arquitectura modular y escalable, provee todos los endpoints necesarios para gestionar clientes, catálogo de llantas, carrito de compras, pedidos y panel de administración.

## 🏗️ Arquitectura

```
src/
├── app.js                  # Configuración central de Express
├── server.js               # Punto de entrada del servidor
├── config/
│   └── config.js           # Configuración de Sequelize por entorno
├── models/                 # 14 modelos Sequelize
├── migrations/             # 14 migraciones de base de datos
├── seeders/                # Datos iniciales de prueba
├── controllers/            # Lógica de los endpoints
├── services/               # Reglas de negocio
├── routes/                 # Definición de rutas
├── middlewares/            # Auth JWT, validaciones, rate limit
├── utils/                  # errorHandler, catchError, customErrors
└── tests/                  # Tests de integración con Jest + Supertest
```

## ⚙️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 24 |
| Framework | Express.js 4 |
| Base de datos | PostgreSQL |
| ORM | Sequelize 6 + Sequelize CLI |
| Autenticación | JSON Web Tokens (JWT) |
| Seguridad | Helmet, CORS, Rate Limiting |
| Validaciones | express-validator |
| Testing | Jest + Supertest |
| Variables de entorno | dotenv |

## 🚀 Instalación y uso

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
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ectyre_db
DB_USER=tu_usuario
DB_PASS=tu_password
TOKEN_SECRET=tu_clave_secreta_jwt
PORT=3000
NODE_ENV=development
```

### 4. Crear base de datos y ejecutar migraciones
```bash
npm run db:create
npm run db:migrate
```

### 5. (Opcional) Cargar datos iniciales
```bash
npm run db:seed
```

### 6. Iniciar el servidor
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

---

## 🔗 Endpoints del API

### 🌍 Públicos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Bienvenida y health check |
| `GET` | `/health` | Estado del servidor |
| `GET` | `/api/v1/llantas` | Listar llantas |
| `GET` | `/api/v1/llantas/:id` | Detalle de llanta |
| `GET` | `/api/v1/llantas/buscar/medida` | Buscar por medida |
| `GET` | `/api/v1/llantas/buscar/vehiculo` | Buscar por vehículo |
| `GET` | `/api/v1/vehiculos/marcas` | Listar marcas de vehículo |
| `GET` | `/api/v1/vehiculos/modelos/:idMarca` | Listar modelos |

### 🔒 Clientes (requieren JWT)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/clientes/registro` | Registro de cliente |
| `POST` | `/api/v1/clientes/login` | Inicio de sesión |
| `GET` | `/api/v1/clientes/perfil` | Ver perfil |
| `PUT` | `/api/v1/clientes/perfil` | Actualizar perfil |
| `GET` | `/api/v1/carrito` | Ver carrito |
| `POST` | `/api/v1/carrito/agregar` | Agregar ítem |
| `PUT` | `/api/v1/carrito/actualizar/:id` | Actualizar cantidad |
| `DELETE` | `/api/v1/carrito/eliminar/:id` | Quitar ítem |
| `DELETE` | `/api/v1/carrito/vaciar` | Vaciar carrito |
| `POST` | `/api/v1/pedidos/checkout` | Crear pedido |
| `GET` | `/api/v1/pedidos` | Mis pedidos |
| `GET` | `/api/v1/pedidos/:id` | Detalle de pedido |
| `GET` | `/api/v1/pedidos/:id/tracking` | Seguimiento |
| `GET` | `/api/v1/direcciones` | Mis direcciones |
| `POST` | `/api/v1/direcciones` | Crear dirección |
| `PUT` | `/api/v1/direcciones/:id` | Actualizar dirección |
| `DELETE` | `/api/v1/direcciones/:id` | Eliminar dirección |

### 🛡️ Admin (requieren JWT + rol admin)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Métricas del negocio |
| `GET` | `/api/v1/admin/clientes` | Lista de clientes |
| `POST` | `/api/v1/admin/llantas` | Crear llanta |
| `PUT` | `/api/v1/admin/llantas/:id` | Editar llanta |
| `DELETE` | `/api/v1/admin/llantas/:id` | Eliminar llanta |
| `PUT` | `/api/v1/admin/pedidos/:id/status` | Cambiar estado de pedido |

---

## 🧪 Tests

```bash
# Correr todos los tests (resetea la BD automáticamente)
npm test

# Modo observador
npm run test:watch
```

Los tests de integración cubren los módulos de: **Clientes**, **Llantas**, **Carrito** y **Pedidos**.

---

## 🗄️ Base de datos

El esquema incluye **14 tablas**:

`marcas_llantas` · `llantas` · `imagenes_llantas` · `marcas_vehiculos` · `modelos_vehiculos` · `compatibilidades` · `clientes` · `direcciones` · `carritos` · `items_carrito` · `metodos_pago` · `pedidos` · `detalles_pedido` · `pagos`

---

## 🤝 Contribuir

Lee el [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el flujo de trabajo y las convenciones del proyecto.

## 📄 Licencia

© 2025 Jefferson Zaruma — Todos los derechos reservados.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:48CAE4,100:6C63FF&height=80&section=footer" alt="footer"/>
