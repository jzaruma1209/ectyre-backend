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
data.info.description = data.info.description.replace(/42 total/g, "52 total");
data.info.description = data.info.description.replace(/Total \| 42 \| 11 \| 16 \| 15/g, "Total | 52 | 16 | 16 | 20");

fs.writeFileSync(postmanFile, JSON.stringify(data, null, 2));
console.log('Postman collection updated successfully!');
