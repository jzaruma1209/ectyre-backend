---
name: node-api-skill
description: >
  Skill para crear, extender y mantener APIs REST con Node.js + Express + Sequelize + PostgreSQL siguiendo exactamente la arquitectura y estilo de código de Antigravity.
  Usar SIEMPRE que el usuario diga: "crea un endpoint", " agrega un módulo", "crea el CRUD de X", "nuevo modelo", "nueva migración", "nueva ruta", o cualquier tarea de desarrollo backend en Node.js/Sequelize.
  También usar cuando pida agregar validaciones, middlewares, servicios o tests.
---

# Node API Skill — Antigravity Style

Este skill captura el patrón exacto de cómo se escribe código en el proyecto Antigravity (basado en bookapp-psql-production). Seguir estas reglas al pie de la letra para que el código generado sea indistinguible del código del desarrollador.

---

## 🏗️ Arquitectura

```
src/
├── app.js               # Express setup: json, helmet, cors, router, errorHandler
├── server.js            # Puerto y conexión DB
├── routes/
│   ├── index.js         # Registra todos los routers en /api/v1
│   └── [nombre].router.js # Rutas de cada módulo
├── controllers/
│   └── [nombre].controllers.js # Solo llama al service, responde JSON
├── services/
│   └── [nombre].services.js # Lógica de negocio, queries Sequelize (class + export instance)
├── models/
│   └── [Nombre].js      # Definición Sequelize + associations
├── migrations/
│   └── [timestamp]-create-[nombre].js
├── middlewares/
│   ├── auth.middleware.js # verifyJWT
│   ├── validation.middleware.js # validateXxxData, validateXxxId
│   ├── verifiedRole.js    # verifyAdmin, verifyAdminOrModerator, verifyAnyRole
│   └── index.js           # Re-exporta todo
└── utils/
    ├── catchError.js    # Wrapper async para controllers
    └── errorHandler.js  # Global error handler (Sequelize errors + statusCode)
```

**Flujo obligatorio:** `route → controller → service → model`

---

## 📋 Reglas de Nomenclatura

| Archivo | Patrón | Ejemplo |
|---------|--------|---------|
| Router | `[nombre].router.js` | `product.router.js` |
| Controller | `[nombre].controllers.js` | `product.controllers.js` |
| Service | `[nombre].services.js` | `product.services.js` |
| Model | `[Nombre].js` (PascalCase) | `Product.js` |
| Migration | `[timestamp]-create-[nombre].js` | `20251010123456-create-product.js` |
| Validación | `validate[Nombre]Data`, `validate[Nombre]Id` | `validateProductData` |
| Router var | `router[Nombre]` | `routerProduct` |

---

## 🎯 Patrones de Código Exactos

### Controller
```javascript
const [nombre]Service = require("../services/[nombre].services");
const catchError = require("../utils/catchError");

// Comentario descriptivo de la acción
const getAll[Nombre]s = catchError(async (req, res) => {
    const items = await [nombre]Service.getAll[Nombre]s();
    res.status(200).json({
        success: true,
        message: "[Nombres] obtenidos correctamente",
        data: items,
    });
});

const get[Nombre]ById = catchError(async (req, res) => {
    const { id } = req.params;
    const item = await [nombre]Service.get[Nombre]ById(id);
    res.status(200).json({
        success: true,
        message: "[Nombre] obtenido correctamente",
        data: item,
    });
});

const create[Nombre] = catchError(async (req, res) => {
    const data = req.body;
    const newItem = await [nombre]Service.create[Nombre](data);
    res.status(201).json({
        success: true,
        message: "[Nombre] creado correctamente",
        data: newItem,
    });
});

const update[Nombre] = catchError(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updated = await [nombre]Service.update[Nombre](id, data);
    res.status(200).json({
        success: true,
        message: "[Nombre] actualizado correctamente",
        data: updated,
    });
});

const delete[Nombre] = catchError(async (req, res) => {
    const { id } = req.params;
    const result = await [nombre]Service.delete[Nombre](id);
    res.status(200).json({
        success: true,
        message: "[Nombre] eliminado correctamente",
        data: result,
    });
});

module.exports = {
    getAll[Nombre]s,
    get[Nombre]ById,
    create[Nombre],
    update[Nombre],
    delete[Nombre],
};
```
**Reglas del controller:**
- SIEMPRE envuelto en `catchError`
- NUNCA lógica de negocio aquí
- Respuesta siempre `{ success: true, message: "...", data: ... }`
- POST → status 201, resto → status 200
- Destruturar `req.params`, `req.body`, `req.user` individualmente

---

### Service
```javascript
const { [Nombre], [RelatedModel] } = require("../models");

class [Nombre]Service {
    // Obtener todos los [nombres]
    async getAll[Nombre]s() {
        try {
            const items = await [Nombre].findAll({
                include: [
                    {
                        model: [RelatedModel],
                        attributes: ["id", "name", ...],
                    },
                ],
            });
            return items;
        } catch (error) {
            throw new Error(`Error al obtener [nombres]: ${error.message}`);
        }
    }

    // Obtener [nombre] por ID
    async get[Nombre]ById(id) {
        try {
            const found = await [Nombre].findByPk(id, {
                include: [...],
            });
            if (!found) {
                throw new Error("[Nombre] no encontrado");
            }
            return found;
        } catch (error) {
            throw new Error(`Error al obtener [nombre]: ${error.message}`);
        }
    }

    // Crear nuevo [nombre]
    async create[Nombre](data) {
        try {
            const { field1, field2, foreignId } = data;
            
            // Verificar si la relación existe (si aplica)
            const related = await [RelatedModel].findByPk(foreignId);
            if (!related) {
                throw new Error("El [modelo relacionado] especificado no existe");
            }

            const newItem = await [Nombre].create({ field1, field2, foreignId });
            
            // Retornar con includes para respuesta completa
            const result = await [Nombre].findByPk(newItem.id, {
                include: [...],
            });
            return result;
        } catch (error) {
            throw new Error(`Error al crear [nombre]: ${error.message}`);
        }
    }

    // Actualizar [nombre]
    async update[Nombre](id, data) {
        try {
            const found = await [Nombre].findByPk(id);
            if (!found) {
                throw new Error("[Nombre] no encontrado");
            }
            await found.update(data);
            
            // Retornar actualizado con includes
            const updated = await [Nombre].findByPk(id, {
                include: [...],
            });
            return updated;
        } catch (error) {
            throw new Error(`Error al actualizar [nombre]: ${error.message}`);
        }
    }

    // Eliminar [nombre]
    async delete[Nombre](id) {
        try {
            const found = await [Nombre].findByPk(id);
            if (!found) {
                throw new Error("[Nombre] no encontrado");
            }
            await found.destroy();
            return { id, message: "[Nombre] eliminado correctamente" };
        } catch (error) {
            throw new Error(`Error al eliminar [nombre]: ${error.message}`);
        }
    }
}

module.exports = new [Nombre]Service();
```
**Reglas del service:**
- SIEMPRE clase con `new` al exportar (`module.exports = new XxxService()`)
- SIEMPRE `try/catch` en cada método
- SIEMPRE verificar existencia antes de update/delete
- SIEMPRE verificar existencia de FK antes de crear
- Throw con mensaje descriptivo: `Error al [acción] [nombre]: ${error.message}`
- Retornar con `findByPk` + includes después de create/update (no retornar solo el objeto creado)

---

### Router
```javascript
const {
    getAll[Nombre]s,
    get[Nombre]ById,
    create[Nombre],
    update[Nombre],
    delete[Nombre],
} = require("../controllers/[nombre].controllers");
const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
    validate[Nombre]Data,
    validate[Nombre]Id,
} = require("../middlewares/validation.middleware");
const {
    verifyAdmin,
    verifyAdminOrModerator,
} = require("../middlewares/verifiedRole");

const router[Nombre] = express.Router();

router[Nombre]
    .route("/")
    .get(getAll[Nombre]s) // 🌍 Público
    .post(verifyJWT, verifyAdminOrModerator, validate[Nombre]Data, create[Nombre]); // 🔒 Admin/Mod

router[Nombre]
    .route("/:id")
    .get(validate[Nombre]Id, get[Nombre]ById) // 🌍 Público
    .put(verifyJWT, verifyAdminOrModerator, validate[Nombre]Id, validate[Nombre]Data, update[Nombre]) // 🔒
    .delete(verifyJWT, verifyAdmin, validate[Nombre]Id, delete[Nombre]); // 🔒 Solo Admin

module.exports = router[Nombre];
```
**Reglas del router:**
- Usar `.route("/")` para agrupar GET/POST en la misma ruta
- Usar `.route("/:id")` para agrupar GET/PUT/DELETE por ID
- Comentario emoji en cada ruta: `// 🌍 Público` o `// 🔒 Privada (rol requerido)`
- Rutas específicas (`/city/:cityId`, `/user/:userId`) ANTES de `/:id`
- Orden de middlewares: `verifyJWT → verifyRol → validateId → validateData → controller`

---

## 🏗️ Model Style
Los modelos deben seguir el estilo de Sequelize CLI pero con soporte para asociaciones claras.

---

## 🔄 Workflow: Crear un Módulo Nuevo Completo

Cuando el usuario diga "crea el CRUD de [X]" o "crea el módulo de [X]", seguir este orden:

**Paso 1 — Generar timestamp:** `Date.now()` o formato `YYYYMMDDHHmmss`

**Paso 2 — Crear en este orden:**
1. `src/migrations/[timestamp]-create-[nombre].js`
2. `src/models/[Nombre].js` (con associations)
3. `src/services/[nombre].services.js`
4. `src/controllers/[nombre].controllers.js`
5. `src/middlewares/validation.middleware.js` (agregar las nuevas funciones)
6. `src/routes/[nombre].router.js`
7. `src/routes/index.js` (registrar el nuevo router)

**Paso 3 — Informar al usuario los comandos a correr:**
```bash
npx sequelize db:migrate
```

---

## 🔒 Reglas de Acceso Estándar

| Operación | Middlewares |
|-----------|-------------|
| GET todos (público) | ninguno |
| GET por ID (público) | `validateXxxId` |
| POST (crear) | `verifyJWT, verifyAdminOrModerator, validateXxxData` |
| PUT (actualizar) | `verifyJWT, verifyAdminOrModerator, validateXxxId, validateXxxData` |
| DELETE | `verifyJWT, verifyAdmin, validateXxxId` |
| Recurso del usuario | `verifyJWT` (sin rol específico) |

---

## 📐 Respuestas HTTP Estándar

```javascript
// Éxito GET / PUT / DELETE
res.status(200).json({ success: true, message: "X obtenido/actualizado/eliminado correctamente", data: result });

// Éxito POST (creación)
res.status(201).json({ success: true, message: "X creado correctamente", data: newItem });

// Error en validation middleware
res.status(400).json({ success: false, message: "Mensaje específico del campo inválido" });

// Error auth
res.status(401).json({ success: false, message: "Token de acceso requerido" });

// Error permisos
res.status(403).json({ message: "Acceso denegado. Se requiere uno de los siguientes roles: ..." });
```

---

## 🧪 Patrones de Tests (Jest + Supertest)

Los tests van en `src/tests/[nombre].test.js` y siguen la estructura:
- Setup con `beforeAll` para crear datos de prueba
- Tests de cada endpoint con `supertest`
- Limpiar datos con `afterAll`
- Cobertura de casos de error (404, 400, 401, 403)

---

## ⚙️ Stack y Dependencias

```json
{
  "express": "^4.21.2",
  "sequelize": "^6.37.4",
  "pg": "latest",
  "pg-hstore": "latest",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "helmet": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5"
}
```
