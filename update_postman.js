const fs = require('fs');

const postmanFile = './ectyre_API_Postman_Collection.json';
const data = JSON.parse(fs.readFileSync(postmanFile, 'utf8'));

// Find folders
const llantasFolder = data.item.find(i => i.name === '🛞 Llantas');
const adminFolder = data.item.find(i => i.name === '👑 Admin');

if (llantasFolder) {
  const hasBuscarGeneral = llantasFolder.item.some(i => i.name.includes("Buscar General"));
  if (!hasBuscarGeneral) {
    llantasFolder.item.splice(4, 0, {
      "name": "Buscar General [🌍 Pública]",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/llantas/buscar-general?search=Michelin&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["llantas", "buscar-general"],
          "query": [
            { "key": "search", "value": "Michelin", "description": "Texto de búsqueda" },
            { "key": "page", "value": "1" },
            { "key": "limit", "value": "10" }
          ]
        },
        "description": "🌍 **PÚBLICA** — Buscar llantas por texto libre (marca, modelo, descripción)."
      }
    });
  }

  const hasRecomendaciones = llantasFolder.item.some(i => i.name.includes("Recomendaciones"));
  if (!hasRecomendaciones) {
    llantasFolder.item.splice(5, 0, {
      "name": "Recomendaciones [🌍 Pública]",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/llantas/recomendaciones?rin=16",
          "host": ["{{baseUrl}}"],
          "path": ["llantas", "recomendaciones"],
          "query": [
            { "key": "rin", "value": "16", "description": "Rin en pulgadas" }
          ]
        },
        "description": "🌍 **PÚBLICA** — Obtener recomendaciones de llantas basadas en un rin."
      }
    });
  }
}

if (adminFolder) {
  const hasImagenesFolder = adminFolder.item.some(i => i.name.includes("Imágenes"));
  if (!hasImagenesFolder) {
    adminFolder.item.push({
      "name": "🖼️ Gestión Imágenes",
      "description": "Gestión de imágenes de llantas (Cloudinary).",
      "item": [
        {
          "name": "Obtener Imágenes de Llanta [🌍 Pública]",
          "request": {
            "method": "GET",
            "header": [],
            "url": "{{baseUrl}}/admin/llantas/1/imagenes",
            "description": "🌍 **PÚBLICA** — Obtener las imágenes asociadas a una llanta."
          }
        },
        {
          "name": "Subir Imagen Única [👑 Admin - form-data]",
          "request": {
            "method": "POST",
            "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
            "body": {
              "mode": "formdata",
              "formdata": [
                { "key": "imagen", "type": "file", "src": "", "description": "Archivo de imagen" },
                { "key": "tipoImagen", "value": "DETALLE", "type": "text", "description": "PRINCIPAL, LATERAL, DETALLE" }
              ]
            },
            "url": "{{baseUrl}}/admin/llantas/1/imagenes",
            "description": "👑 **ADMIN** — Sube una imagen para una llanta a Cloudinary."
          }
        },
        {
          "name": "Subir Múltiples Imágenes [👑 Admin - form-data]",
          "request": {
            "method": "POST",
            "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
            "body": {
              "mode": "formdata",
              "formdata": [
                { "key": "imagenes", "type": "file", "src": "", "description": "Múltiples archivos" }
              ]
            },
            "url": "{{baseUrl}}/admin/llantas/1/imagenes/multiple",
            "description": "👑 **ADMIN** — Sube hasta 5 imágenes de una sola vez."
          }
        },
        {
          "name": "Establecer Imagen Principal [👑 Admin]",
          "request": {
            "method": "PATCH",
            "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
            "url": "{{baseUrl}}/admin/llantas/1/imagenes/1/principal",
            "description": "👑 **ADMIN** — Establece una imagen como la principal de la llanta."
          }
        },
        {
          "name": "Eliminar Imagen [👑 Admin]",
          "request": {
            "method": "DELETE",
            "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
            "url": "{{baseUrl}}/admin/imagenes/1",
            "description": "👑 **ADMIN** — Elimina una imagen de la base de datos y de Cloudinary."
          }
        }
      ]
    });
  }
}

// Check for Auth folder
const hasAuthFolder = data.item.some(i => i.name === '🔑 Auth (Google)');
if (!hasAuthFolder) {
  data.item.splice(1, 0, {
    "name": "🔑 Auth (Google)",
    "description": "Endpoints para autenticación con Google OAuth 2.0. Nota: Se deben probar desde el navegador para completar el flujo de redirección.",
    "item": [
      {
        "name": "Login con Google [🌍 Pública]",
        "request": {
          "method": "GET",
          "header": [],
          "url": "{{baseUrl}}/auth/google",
          "description": "🌍 **PÚBLICA** — Inicia el flujo de OAuth2 con Google. Se debe acceder desde el navegador."
        }
      },
      {
        "name": "Callback de Google [🌍 Pública]",
        "request": {
          "method": "GET",
          "header": [],
          "url": "{{baseUrl}}/auth/google/callback",
          "description": "🌍 **PÚBLICA** — Endpoint donde Google redirige después de autenticarse. Genera el JWT y redirige al frontend."
        }
      },
      {
        "name": "Fallo Autenticación [🌍 Pública]",
        "request": {
          "method": "GET",
          "header": [],
          "url": "{{baseUrl}}/auth/failure",
          "description": "🌍 **PÚBLICA** — Endpoint al que se redirige si falla la autenticación de Google."
        }
      }
    ]
  });
}

// Update counts in description
const hasPromociones = data.item.some(i => i.name === '🖼️ Promociones');
if (!hasPromociones) {
  data.item.push({
    "name": "🖼️ Promociones",
    "description": "Endpoints para gestionar las imágenes de promociones y banners.",
    "item": [
      {
        "name": "Listar Promociones [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/admin/promociones" }
      },
      {
        "name": "Detalle Promocion [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/admin/promociones/1" }
      },
      {
        "name": "Crear Promoción [👑 Admin]",
        "request": {
          "method": "POST",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
          "body": {
            "mode": "formdata",
            "formdata": [
              { "key": "imagen", "type": "file" },
              { "key": "nombre", "value": "Promo Verano", "type": "text" },
              { "key": "activo", "value": "true", "type": "text" },
              { "key": "idLlanta", "value": "1", "type": "text" }
            ]
          },
          "url": "{{baseUrl}}/admin/promociones"
        }
      },
      {
        "name": "Actualizar Promoción [👑 Admin]",
        "request": {
          "method": "PUT",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
          "body": {
            "mode": "formdata",
            "formdata": [
              { "key": "nombre", "value": "Promo Invierno", "type": "text" }
            ]
          },
          "url": "{{baseUrl}}/admin/promociones/1"
        }
      },
      {
        "name": "Eliminar Promoción [👑 Admin]",
        "request": {
          "method": "DELETE",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
          "url": "{{baseUrl}}/admin/promociones/1"
        }
      },
      {
        "name": "Toggle Activo Promoción [👑 Admin]",
        "request": {
          "method": "PATCH",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }],
          "url": "{{baseUrl}}/admin/promociones/1/toggle"
        }
      }
    ]
  });
}

// Check for Vehículos folder
const hasVehiculosFolder = data.item.some(i => i.name === '🚗 Vehículos');
if (!hasVehiculosFolder) {
  data.item.push({
    "name": "🚗 Vehículos",
    "description": "Catálogo de vehículos, marcas y modelos.",
    "item": [
      {
        "name": "Listar marcas activas [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/vehiculos/marcas" }
      },
      {
        "name": "Marcas + modelos anidados [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/vehiculos/marcas/completo" }
      },
      {
        "name": "Modelos de una marca [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/vehiculos/marcas/1/modelos" }
      }
    ]
  });
}

// Check for Compatibilidad folder
const hasCompatibilidadFolder = data.item.some(i => i.name === '🔗 Compatibilidad');
if (!hasCompatibilidadFolder) {
  data.item.push({
    "name": "🔗 Compatibilidad",
    "description": "Compatibilidad entre llantas y vehículos.",
    "item": [
      {
        "name": "Llantas por vehículo [🌍 Pública]",
        "request": { 
          "method": "GET", 
          "header": [], 
          "url": {
            "raw": "{{baseUrl}}/compatibilidad/vehiculo?idModelo=1&anio=2020",
            "host": ["{{baseUrl}}"],
            "path": ["compatibilidad", "vehiculo"],
            "query": [
              { "key": "idModelo", "value": "1" },
              { "key": "anio", "value": "2020" }
            ]
          }
        }
      },
      {
        "name": "Vehículos por llanta [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/compatibilidad/llanta/1" }
      },
      {
        "name": "Detalle de compatibilidad [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/compatibilidad/1" }
      },
      {
        "name": "Crear compatibilidad [👑 Admin]",
        "request": {
          "method": "POST",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }, { "key": "Content-Type", "value": "application/json" }],
          "body": {
            "mode": "raw",
            "raw": "{\n  \"idLlanta\": 1,\n  \"idModelo\": 1,\n  \"anioInicio\": 2015,\n  \"anioFin\": 2022\n}"
          },
          "url": "{{baseUrl}}/compatibilidad"
        }
      },
      {
        "name": "Actualizar compatibilidad [👑 Admin]",
        "request": {
          "method": "PUT",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }, { "key": "Content-Type", "value": "application/json" }],
          "body": {
            "mode": "raw",
            "raw": "{\n  \"anioInicio\": 2016\n}"
          },
          "url": "{{baseUrl}}/compatibilidad/1"
        }
      },
      {
        "name": "Eliminar compatibilidad [👑 Admin]",
        "request": { "method": "DELETE", "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }], "url": "{{baseUrl}}/compatibilidad/1" }
      }
    ]
  });
}

// Check for Catálogos folder
const hasCatalogosFolder = data.item.some(i => i.name === '📋 Catálogos');
if (!hasCatalogosFolder) {
  data.item.push({
    "name": "📋 Catálogos",
    "description": "Catálogos generales del sistema.",
    "item": [
      {
        "name": "Todos los catálogos en uno [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos" }
      },
      {
        "name": "Listar Modelos de Llanta [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/modelos-llanta" }
      },
      {
        "name": "Crear Modelo de Llanta [👑 Admin]",
        "request": {
          "method": "POST",
          "header": [{ "key": "Authorization", "value": "Bearer {{adminToken}}" }, { "key": "Content-Type", "value": "application/json" }],
          "body": {
            "mode": "raw",
            "raw": "{\n  \"nombre\": \"Pilot Sport 4\",\n  \"idMarca\": 1\n}"
          },
          "url": "{{baseUrl}}/catalogos/modelos-llanta"
        }
      },
      {
        "name": "Listar Índices de Carga [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/indices-carga" }
      },
      {
        "name": "Listar Índices de Velocidad [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/indices-velocidad" }
      },
      {
        "name": "Listar Temperaturas [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/temperaturas" }
      },
      {
        "name": "Listar Tipos de Llanta [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/tipos-llanta" }
      },
      {
        "name": "Listar Sentidos de Rotación [🌍 Pública]",
        "request": { "method": "GET", "header": [], "url": "{{baseUrl}}/catalogos/sentidos-rotacion" }
      }
    ]
  });
}

data.info.description = data.info.description.replace(/52 total/g, "84 total");
data.info.description = data.info.description.replace(/42 total/g, "84 total");
data.info.description = data.info.description.replace(/Total \| 52 \| 16 \| 16 \| 20/g, "Total | 84 | 45 | 5 | 11 | 23");
data.info.description = data.info.description.replace(/Total \| 42 \| 11 \| 16 \| 15/g, "Total | 84 | 45 | 5 | 11 | 23");

fs.writeFileSync(postmanFile, JSON.stringify(data, null, 2));
console.log('Postman collection updated successfully with new endpoints!');
