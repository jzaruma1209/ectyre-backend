const fs = require('fs');
const filepath = 'Ectyre_API_Postman_Collection.json';
const doc = JSON.parse(fs.readFileSync(filepath, 'utf8'));

let description = `
# 🛞 Ectyre API — Colección Completa para Postman

**Versión:** 1.0.2
**Base URL:** \`http://localhost:8080/api/v1\`
**Autenticación:** Bearer Token (JWT)

---

## 📋 Descripción General
Ectyre es una API REST para una tienda de llantas online. Permite gestionar catálogo de llantas, clientes, carrito de compras, pedidos, direcciones de entrega, y un panel de administración completo con reportes.

---

## 🔑 Leyenda de Seguridad
- 🌍 **Pública** — Sin autenticación requerida
- 🔒 **Privada** — Requiere \`Authorization: Bearer <token>\`
- 👑 **Admin** — Requiere JWT + rol Admin
- 🌍/🔒 **Mixta** — Funciona con o sin autenticación (carrito soporta sesión anónima)

---

## 🧪 Cómo Testear (Paso a Paso)

### 1. Configurar Variables
La colección usa la variable \`{{baseUrl}}\` configurada a \`http://localhost:8080/api/v1\`.
Crea un Environment en Postman con:
- \`baseUrl\` = \`http://localhost:8080/api/v1\`
- \`token\` = (se llena automáticamente al hacer Login Usuario)
- \`adminToken\` = (se llena automáticamente al hacer Login Admin)

### 2. Flujo Recomendado de Testing
1. Ejecuta **Health Check** para verificar que el servidor está arriba
2. Ejecuta **Registro** para crear un usuario
3. Ejecuta **Login Usuario** → el token se guarda automáticamente en \`{{token}}\`
4. Ejecuta **Login Admin** → el token se guarda en \`{{adminToken}}\`
5. Ahora puedes probar cualquier endpoint protegido

### 3. Datos del Seeder
- Llantas: IDs 1–13
- Marcas de vehículos: IDs 1–8
- Admin: \`admin@ectyre.com\` / \`Admin2026#Ectyre\`
- Usuario de prueba: Registra uno nuevo con el endpoint de Registro

### 4. Errores Comunes
- **401 Unauthorized**: Token JWT expirado o no enviado. Haz login de nuevo.
- **403 Forbidden**: No tienes permisos de Admin. Usa \`{{adminToken}}\`.
- **429 Too Many Requests**: Rate limit alcanzado. Espera unos minutos.
- **400 Bad Request**: Revisa el body JSON enviado, campos requeridos faltantes.

---

## 📊 Resumen de Endpoints (42 total)

| Módulo | Total | Públicos 🌍 | Autenticados 🔒 | Admin 👑 |
|---|---|---|---|---|
| Health Check | 2 | 2 | 0 | 0 |
| Clientes | 5 | 2 | 3 | 0 |
| Llantas | 7 | 4 | 0 | 3 |
| Vehículos | 3 | 3 | 0 | 0 |
| Carrito | 5 | 0 | 5* | 0 |
| Pedidos | 4 | 0 | 4 | 0 |
| Direcciones | 4 | 0 | 4 | 0 |
| Admin | 12 | 0 | 0 | 12 |
| **Total** | **42** | **11** | **16** | **15** |

> *El carrito acepta autenticación opcional (mixta)

---

*Colección generada para Ectyre API v1.0.2 — Última actualización:* ` + new Date().toISOString().split('T')[0];

doc.info.description = description;

fs.writeFileSync(filepath, JSON.stringify(doc, null, 2), 'utf8');
console.log('Descriptions fixed!');
