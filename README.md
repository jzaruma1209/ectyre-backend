<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,100:48CAE4&height=160&section=header&text=ectyre-backend&fontSize=45&fontColor=ffffff&fontAlignY=45&desc=REST%20API%20·%20Node.js%20·%20Express%20·%20PostgreSQL&descAlignY=68&descSize=16&animation=fadeIn" alt="header"/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</p>

---

## 📖 Descripción

**Ectyre Backend** es la API REST del marketplace de llantas y servicios automotrices **Ectyre**. Construida con una arquitectura modular y escalable, provee todos los endpoints necesarios para gestionar usuarios, productos, pedidos y más.

## 🏗️ Arquitectura

```
src/
├── app.js              # Configuración central de Express
├── server.js           # Punto de entrada del servidor
├── routes/             # Definición de rutas de la API
│   └── index.js        # Router principal
└── utils/              # Utilidades compartidas
```

## ⚙️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Base de datos | PostgreSQL |
| ORM | Sequelize + Sequelize CLI |
| Autenticación | JSON Web Tokens (JWT) |
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
JWT_SECRET=tu_clave_secreta
PORT=3000
```

### 4. Ejecutar migraciones
```bash
npx sequelize-cli db:migrate
```

### 5. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔗 Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor |
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `GET` | `/api/products` | Listar productos |
| `POST` | `/api/products` | Crear producto (admin) |
| `GET` | `/api/orders` | Listar pedidos |

## 🤝 Contribuir

Lee el [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el flujo de trabajo y las convenciones del proyecto.

## 📄 Licencia

© 2025 Jefferson Zaruma — Todos los derechos reservados.

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:48CAE4,100:6C63FF&height=80&section=footer" alt="footer"/>
