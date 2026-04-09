+# 🌐 Guía de Integración Backend-Frontend (Agentes Frontend)

Este documento está diseñado específicamente para los **Módulos Frontend** y **Agentes de IA** encargados de construir la interfaz de usuario (UI), las "Cards" de productos, y los formularios de administración del E-commerce Ectyre.

---

## 📌 1. El Archivo "Postman Collection" es tu Mejor Amigo
En la raíz del backend existe el archivo: **`Ectyre_API_Postman_Collection.json`**.
- **¿Por qué es útil?** Este archivo no solo lista las rutas, sino que contiene **el payload exacto**, los headers necesarios (ej: `form-data` vs `application/json`), y ejemplos reales de cómo interactuar con el backend.
- **Agentes Frontend:** Si tienes dudas de cómo enviar un dato, revisa el archivo Postman Collection.

---

## 📌 2. Integrando el Catálogo (Las Cards del Frontend)

Para renderizar las famosas "Cards de Llantas" en la tienda principal del usuario, NO necesitas hacer múltiples llamadas a diferentes tablas. El Backend está diseñado para entregarte todo procesado.

### Endpoint a consumir:
- **`GET /api/v1/llantas`** (Público, sin token)
- **Propósito:** Devuelve el array de llantas listo para iterar en React/Next.js y generar las `<TireCard />`.

**Estructura esperada que recibirás del Backend:**
```json
{
  "success": true,
  "data": [
    {
      "idLlanta": 1,
      "modelo": "Eagle Sport",
      "precio": 85.50,
      "stock": 20,
      "marca": {
        "idMarca": 2,
        "nombre": "Goodyear"
      },
      "imagenes": [
        { "id": 1, "url": "https://res.cloudinary.com/..." }
      ]
    }
  ]
}
```
**Instrucción al Agente UI:** Solo debes iterar sobre `response.data` y mapear:
- Título: `item.marca.nombre + ' ' + item.modelo`
- Imagen: `item.imagenes[0]?.url`
- Precio: `item.precio`

---

## 📌 3. Integrando la Creación de Llantas (Frontend Administrativo)

El panel de administración debe permitir agregar una llanta y subir sus fotos al mismo tiempo. Al contrario de un registro normal (que usa JSON), **se debe usar `multipart/form-data`** porque incluye archivos físicos.

### Endpoint a consumir:
- **`POST /api/v1/llantas`**
- **Auth Requerida:** Bearer Token (Rol Admin)

**Instrucción al Agente UI:** El agente que cree el formulario en React debe estructurar la llamada usando `FormData` nativo del navegador, no `JSON.stringify`.

**Ejemplo de cómo el Frontend debe enviar la data:**
```javascript
const formData = new FormData();

// Campos de texto y números
formData.append('idMarca', 1);
formData.append('modelo', 'Primacy 4');
formData.append('ancho', 205);
formData.append('perfil', 55);
formData.append('rin', 16);
formData.append('precio', 180.50);
formData.append('stock', 20);
formData.append('descripcion', 'Llanta premium...');

// Imágenes (si el usuario subió múltiples desde un <input type="file" multiple>)
const files = fileInputRef.current.files;
for (let i = 0; i < files.length; i++) {
  formData.append('imagenes', files[i]); // El backend espera la llave 'imagenes'
}

// Envío usando Axios o Fetch
await axios.post('http://localhost:8080/api/v1/llantas', formData, {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### ¿Qué hace el backend con esto?
Internamente, el backend tomará estos datos divididos, guardará la llanta en la base de datos principal, subirá las imágenes a **Cloudinary**, y guardará las URLs en la tabla de imágenes. Todo en un solo paso.

---

## 📌 4. Resumen de Recomendaciones para Agentes Frontend

1. **Autenticación en UI:** Almacena el `token` devuelto por `/api/v1/clientes/login` o el callback de Google en el LocalStorage, Zustand o un contexto de React.
2. **Formularios con Archivos:** Si el endpoint dice "Sube imágenes a Cloudinary" en la documentación de Postman, DEBES construir el request usando `form-data` y no JSON.
3. **Manejo de Errores:** Todos los endpoints del backend devuelven un objeto de error estandarizado:
   ```json
   {
     "success": false,
     "message": "Descripción del error humano"
   }
   ```
   Siempre lee el `message` y úsalo para lanzar notificaciones toast en la UI.
