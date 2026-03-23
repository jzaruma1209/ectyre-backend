---
description: Skill maestro para identificar, diagnosticar y resolver errores comunes (Troubleshooting) en la API REST de Ectyre. Usar SIEMPRE que haya problemas de autenticación (401/403), inconsistencias de base de datos, o errores del servidor (500).
---

# 🚨 Guía de Errores y Solución de Problemas (Troubleshooting)

Como asistente de Inteligencia Artificial (Antigravity), utiliza esta guía para diagnosticar rápidamente cualquier problema reportado por el usuario o encontrado en los logs del servidor de **Ectyre API**.

---

## 🔑 1. Errores de Autenticación y Acceso

| Código HTTP | Error (Mensaje) | Causa Probable | Solución / Diagnóstico a seguir |
|-------------|-----------------|----------------|----------|
| **401** | `Token inválido` | El token enviado en el header `Authorization` no es válido o ha sido manipulado. | Sugerir al usuario que inicie sesión nuevamente o verifique que el Header diga `Bearer <token>`. |
| **401** | `Token expirado` | El token JWT tiene más de 7 días de antigüedad. | El usuario debe ejecutar el endpoint de login de nuevo. |
| **403** | `Acceso denegado (admin)` | Estás intentando acceder a una ruta de `/admin` con un usuario que no tiene rol de administrador. | Asegurarse de realizar el requests obteniendo el token desde la cuenta `admin@ectyre.com`. (El DB debe incluir rol="admin"). |
| **403** | `Acceso denegado CORS` | Llamada a la API desde un dominio que no está en la lista blanca de `.env`. | Revisa la expresión regular o URL en la variable `CORS_ORIGIN` en `.env`. |

---

## 🗄️ 2. Errores de Base de Datos y Validación

| Código HTTP | Error (Mensaje) | Causa Probable | Acciones de Diagnóstico |
|-------------|-----------------|----------------|----------|
| **400** | `Error de validación...` | Los datos enviados no cumplen con el formato (express-validator o Sequelize). | Revisa el objeto `errors` en la respuesta JSON para ver qué campo falló e indica al usuario el formato correcto. |
| **409** | `Ya existe un registro...` | Unique constraint violated en la Base de Datos. | El email o identificación enviada ya está en uso. Informar al usuario del conflicto (ej. error_code: 23505). |
| **400** | `Recurso relacionado no existe` | Foreign Key constraint fallback. | El ID enviado en foreign keys (ej. idMarca, idLlanta) no existe en la tabla padre. Busca IDs reales primero. |
| **503** | `Servicio no disponible` | SequelizeConnectionError. | Verificar que PostgreSQL esté iniciado levantado localmente o comprobar credenciales y status de BD en la nube (`DB_URL`). |

---

## 🛒 3. Errores de Lógica de Negocio (Módulos)

### Carrito y Pedidos
- **`Stock insuficiente`**: Intentas agregar más unidades de las existentes de una llanta.
  - *Diagnóstico*: Revisar el endpoint PUT/POST en Carrito. Si lanza esto, verificar en tabla `llantas` la columna `stock`.
- **`Carrito vacío en checkout`**: Hacer un pedido sin items en carrito.
  - *Diagnóstico*: En la ruta de checkout, llamar internamente a Ver Carrito primero para verificar si existe al menos un subitem.

### Identificación
- **`Identificación inválida`**: Cédula/RUC erróneo.
  - *Diagnóstico*: Revisar utilidades que validan si envían el regex correcto o longitud de N caracteres.

---

## 🛠️ 4. Debugging para Antigravity / Desarrollador

Cuando se obtenga y detecte un error **500 (Error interno del servidor)**:

1. **Revisa la Consola**: En modo `development`, en la terminal leer el log detallado. Extraer la porción donde sale el error exacto (Línea donde falló el `TypeError`).
2. **Logs de Producción**: Los errores se enmascaran, así que se DEBE ver los logs del sistema y no solo el output POSTMAN.
3. **Variables de Entorno**: Muchos errores de inicialización son de `.env` (ej: `TOKEN_SECRET` no definido). Validar disponibilidad del `.env`.

---

## 📈 5. Códigos de Estado Estándar en este API

- **200/201**: 🎉 ¡Todo bien!
- **400**: ❌ Datos inválidos desde el cliente.
- **401**: 🔑 No autenticado (Sin token).
- **403**: 🚫 Prohibido (Rol insuficiente).
- **404**: 🔍 Recurso inexistente.
- **500**: 🔥 Crash crítico en la API (Bug).

---

**Nota Final:** Al detectar un fallo, **utiliza el errorHandler.js de Ectyre** y esta guía para identificar exactamente donde reside el fallo en las vistas, modelos o controllers.
