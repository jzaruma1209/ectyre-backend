# 🚨 Guía de Errores y Solución de Problemas (Troubleshooting)

Esta guía detalla los errores más comunes que puedes encontrar al usar la API de **Ectyre**, qué significan y cómo solucionarlos rápidamente.

---

## 🔑 1. Errores de Autenticación y Acceso

| Código HTTP | Error (Mensaje) | Causa Probable | Solución |
|-------------|-----------------|----------------|----------|
| **401** | `Token inválido` | El token enviado en el header `Authorization` no es válido o ha sido manipulado. | Vuelve a iniciar sesión para obtener un token nuevo. |
| **401** | `Token expirado` | El token JWT tiene más de 7 días de antigüedad. | Debes hacer login de nuevo. |
| **403** | `Acceso denegado (admin)` | Estás intentando acceder a una ruta de `/admin` con un usuario que no tiene rol de administrador. | Asegúrate de estar usando la cuenta `admin@ectyre.com`. |
| **403** | `Acceso denegado CORS` | Estás intentando llamar a la API desde un dominio que no está en la lista blanca de `.env`. | Revisa la variable `CORS_ORIGIN` en tu archivo `.env`. |

---

## 🗄️ 2. Errores de Base de Datos y Validación

| Código HTTP | Error (Mensaje) | Causa Probable | Solución |
|-------------|-----------------|----------------|----------|
| **400** | `Error de validación...` | Los datos enviados no cumplen con el formato (ej: email inválido, password muy corto). | Revisa el objeto `errors` en la respuesta para ver qué campo falló. |
| **409** | `Ya existe un registro...` | Estás intentando registrar un email o número de identificación que ya está en uso. | Usa un email o ID diferente, o recupera la cuenta existente. |
| **400** | `Recurso relacionado no existe` | Estás enviando un ID de marca o dirección que no existe en la base de datos (Error de FK). | Verifica que el ID enviado sea correcto consultando primero el listado de marcas/direcciones. |
| **503** | `Servicio no disponible` | La API no puede conectarse a la base de datos PostgreSQL. | Verifica que tu servidor de base de datos esté encendido y que las credenciales en `.env` sean correctas. |

---

## 🛒 3. Errores de Lógica de Negocio (Módulos)

### Carrito y Pedidos
- **`Stock insuficiente`**: Intentas agregar más unidades de una llanta de las que hay disponibles. 
  - *Solución*: Baja la cantidad en el carrito o actualiza el stock en el panel admin.
- **`Carrito vacío en checkout`**: Intentas hacer un pedido pero no tienes nada en el carrito.
  - *Solución*: Agrega productos antes de llamar a `/pedidos/checkout`.

### Identificación
- **`Identificación inválida`**: El número de cédula o RUC no pasó las validaciones de formato.
  - *Solución*: Asegúrate de enviar 10 dígitos para cédula o 13 para RUC.

---

## 🛠️ 4. Debugging para Desarrolladores

Si encuentras un error **500 (Error interno del servidor)**:

1. **Revisa la Consola**: Si estás en modo `development`, la terminal mostrará un log detallado con el archivo y la línea exacta del error.
2. **Logs de Producción**: En producción, los errores se resumen para no exponer rutas internas, pero se guardan en el log del servidor (ej: logs de Vercel o PM2).
3. **Variables de Entorno**: El 90% de los errores críticos de arranque se deben a una variable faltante en el `.env`. Asegúrate de tener `TOKEN_SECRET` y las `DB_CREDENTIALS` definidas.

---

## 📈 5. Códigos de Estado Estándar (Resumen)

- **200/201**: 🎉 ¡Todo bien! Operación exitosa.
- **400**: ❌ Bad Request (Datos inválidos).
- **401**: 🔑 No autorizado (Falta o falló el token).
- **403**: 🚫 Prohibido (No tienes permisos).
- **404**: 🔍 No encontrado (URL o ID inexistente).
- **429**: 🚦 Too Many Requests (Rate limit excedido).
- **500**: 🔥 Problema serio en el servidor.

---
*Si el error persiste, consulta el [README.md](README.md) para verificar la configuración inicial.*
