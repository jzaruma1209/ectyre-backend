# Express + Sequelize + PostgreSQL Template

🚀 Plantilla base para crear APIs REST con Node.js, Express.js, Sequelize ORM y PostgreSQL.

## ⚡ Instalación rápida

```bash
# Clonar la plantilla
git clone https://github.com/jzaruma1209/create-exp-sq-paul.git mi-api
cd mi-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# Ejecutar en desarrollo
npm run dev
```

## 📁 Estructura del proyecto

```
mi-api/
├── src/
│   ├── app.js          # Configuración de Express
│   ├── server.js       # Servidor principal
│   ├── routes/         # Rutas de la API
│   │   └── index.js
│   └── utils/          # Utilidades
│       ├── catchError.js     # Manejo de errores async
│       ├── connection.js     # Conexión a PostgreSQL
│       └── errorHandler.js   # Middleware de errores
├── .env.example        # Variables de entorno de ejemplo
├── .gitignore
└── package.json
```

## ⚙️ Configuración

### 1. Base de datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y ejecutándose. Luego configura tu archivo `.env`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/mi_base_datos
PORT=8080
NODE_ENV=development
```

### 2. Variables de entorno

- `DATABASE_URL`: URL completa de conexión a PostgreSQL
- `PORT`: Puerto donde se ejecutará el servidor (por defecto: 8080)
- `NODE_ENV`: Entorno de ejecución (development, production)

## 🛠️ Scripts disponibles

- `npm start` - Ejecuta el servidor en producción
- `npm run dev` - Ejecuta con nodemon para desarrollo (recarga automática)

## 🔧 Tecnologías incluidas

- **Express.js 4.21** - Framework web rápido y minimalista
- **Sequelize 6.37** - ORM para PostgreSQL con validaciones
- **PostgreSQL** - Base de datos relacional robusta
- **CORS** - Middleware para manejo de CORS
- **Helmet** - Middleware de seguridad HTTP
- **dotenv** - Carga de variables de entorno
- **nodemon** - Recarga automática en desarrollo

## 🚀 Uso básico

El servidor inicia en `http://localhost:8080` con:

- **Ruta principal**: `GET /` - Mensaje de bienvenida
- **Health check**: `GET /health` - Estado del servidor
- **Base para API**: `/api/*` - Agrega tus rutas aquí

### Ejemplo de nueva ruta:

```javascript
// src/routes/users.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Lista de usuarios" });
});

router.post("/", (req, res) => {
  res.json({ message: "Usuario creado" });
});

module.exports = router;
```

```javascript
// src/routes/index.js - Agregar la nueva ruta
const usersRouter = require("./users");
router.use("/users", usersRouter);
```

## 🔗 Características incluidas

- ✅ Configuración de Express con middlewares de seguridad
- ✅ Conexión a PostgreSQL con Sequelize
- ✅ Manejo centralizado de errores
- ✅ Estructura de carpetas organizada
- ✅ Variables de entorno configuradas
- ✅ CORS habilitado
- ✅ Logs de errores
- ✅ Recarga automática en desarrollo

## 📝 Próximos pasos

1. **Crear modelos**: Define tus modelos en `src/models/`
2. **Agregar rutas**: Crea nuevas rutas en `src/routes/`
3. **Middlewares**: Agrega middlewares personalizados en `src/middlewares/`
4. **Controladores**: Organiza la lógica en `src/controllers/`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC - mira el archivo [LICENSE](LICENSE) para más detalles.

## 🐛 Reportar problemas

Si encuentras algún bug o tienes una sugerencia, por favor [abre un issue](https://github.com/jzaruma1209/create-exp-sq-paul/issues).

---

**¡Tu API está lista para funcionar! 🎉**
