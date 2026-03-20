# 🚀 Guía de Despliegue a Producción — API Ectyre

Esta guía detalla los pasos necesarios para desplegar la **API Ectyre** en entornos de producción (Vercel, Render, Heroku, VPS).

---

## 📋 Requisitos Previos

- **PostgreSQL**: Base de datos accesible (Neon, Supabase, RDS, etc.).
- **Node.js**: v20.x o superior.
- **Git**: Repositorio en GitHub/GitLab.

---

## ⚙️ Variables de Entorno (Secrets)

Debes configurar las siguientes variables en tu plataforma de hosting:

| Variable | Descripción | Ejemplo / Valor |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DATABASE_URL` | URL de conexión completa a PG | `postgres://user:pass@host:port/db?sslmode=require` |
| `TOKEN_SECRET` | Secreto para firmar JWT | Mínimo 64 caracteres aleatorios |
| `CORS_ORIGIN` | Dominios de frontend permitidos | `https://ectyre.com` |
| `PORT` | Puerto del servidor | `8080` (Opcional en serverless) |

---

## 🚢 Despliegue en Vercel

1. **Instalar Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Desplegar**: `vercel`
4. **Configurar DB**: Ejecuta las migraciones antes de usar la API (ver sección Bases de Datos).

---

## 🗄️ Bases de Datos (Migraciones y Seeds)

En producción, no se debe usar `npm install` local para migrar. Usa los scripts preparados en `package.json`:

### 1. Ejecutar migraciones
Para crear las 14 tablas en la base de datos de producción:
```bash
npm run db:migrate:prod
```

### 2. Cargar datos iniciales
Para cargar marcas, llantas de prueba y usuario administrador:
```bash
npm run db:seed:prod
```

---

## 🛡️ Seguridad Implementada

La API ya incluye protecciones críticas para producción:
- **Helmet**: Headers de seguridad HTTP.
- **CORS**: Solo permite orígenes configurados en `CORS_ORIGIN`.
- **Rate Limiting**: Protege contra ataques de fuerza bruta en login.
- **Error Handling**: Oculta stack-traces en producción.
- **SSL**: Configurado en `src/config/config.js` para conexiones seguras con DB.

---

## ✅ Health Check

Una vez desplegada, verifica que la API responda correctamente:
- `GET /` — Bienvenida
- `GET /health` — Estado del servidor

---

© 2025 Ectyre Team — ¡Listo para volar! 🦅
