const fs = require('fs');
const filepath = 'Ectyre_API_Postman_Collection.json';
const doc = JSON.parse(fs.readFileSync(filepath, 'utf8'));

// Find "👑 Admin" module
const adminModule = doc.item.find(i => i.name === '👑 Admin');
if (!adminModule) throw new Error('Admin module not found');

// 1. Add "Detalle Pedido [👑 Admin]" to "📦 Gestión Pedidos"
const gestionPedidos = adminModule.item.find(i => i.name === '📦 Gestión Pedidos');
if (gestionPedidos) {
  const detalleExists = gestionPedidos.item.find(i => i.name === 'Detalle Pedido [👑 Admin]');
  if (!detalleExists) {
    gestionPedidos.item.push({
      name: "Detalle Pedido [👑 Admin]",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
        url: "{{baseUrl}}/admin/pedidos/1",
        description: "👑 **ADMIN** — Detalle de un pedido en el panel.\n\n**URL Param:** Cambia `/1` por el ID del pedido."
      }
    });
  }
}

// 2. Add Inventario group if not exists
let inventarioGroup = adminModule.item.find(i => i.name === '🏭 Inventario');
if (!inventarioGroup) {
  inventarioGroup = {
    name: "🏭 Inventario",
    description: "Gestión de stock de llantas.",
    item: []
  };
  adminModule.item.push(inventarioGroup);
}
const stockExists = inventarioGroup.item.find(i => i.name === 'Actualizar Stock Llanta [👑 Admin]');
if (!stockExists) {
  inventarioGroup.item.push({
    name: "Actualizar Stock Llanta [👑 Admin]",
    request: {
      method: "PATCH",
      header: [
        { key: "Authorization", value: "Bearer {{adminToken}}" },
        { key: "Content-Type", value: "application/json" }
      ],
      body: { mode: "raw", raw: "{\n  \"cantidad\": 5\n}", options: { raw: { language: "json" } } },
      url: "{{baseUrl}}/admin/llantas/1/stock",
      description: "👑 **ADMIN** — Aumentar o disminuir stock de una llanta.\n\n**URL Param:** Cambia `/1` por el ID de la llanta."
    }
  });
}

// 3. Add Reportes group if not exists
let reportesGroup = adminModule.item.find(i => i.name === '📈 Reportes');
if (!reportesGroup) {
  reportesGroup = {
    name: "📈 Reportes",
    description: "Reportes de ventas y estadísticas.",
    item: []
  };
  adminModule.item.push(reportesGroup);
}

if (!reportesGroup.item.find(i => i.name === 'Reporte de Ventas [👑 Admin]')) {
  reportesGroup.item.push({
    name: "Reporte de Ventas [👑 Admin]",
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      url: {
        raw: "{{baseUrl}}/admin/reportes/ventas?desde=&hasta=",
        host: ["{{baseUrl}}"],
        path: ["admin", "reportes", "ventas"],
        query: [
          { key: "desde", value: "", description: "Fecha inicio YYYY-MM-DD" },
          { key: "hasta", value: "", description: "Fecha fin YYYY-MM-DD" }
        ]
      },
      description: "👑 **ADMIN** — Reporte de ventas en un rango de fechas."
    }
  });
}

if (!reportesGroup.item.find(i => i.name === 'Top Productos Vendidos [👑 Admin]')) {
  reportesGroup.item.push({
    name: "Top Productos Vendidos [👑 Admin]",
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      url: {
        raw: "{{baseUrl}}/admin/reportes/productos-top?limit=10",
        host: ["{{baseUrl}}"],
        path: ["admin", "reportes", "productos-top"],
        query: [{ key: "limit", value: "10" }]
      },
      description: "👑 **ADMIN** — Top de productos más vendidos."
    }
  });
}

if (!reportesGroup.item.find(i => i.name === 'Stats Carritos [👑 Admin]')) {
  reportesGroup.item.push({
    name: "Stats Carritos [👑 Admin]",
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
      url: "{{baseUrl}}/admin/stats/carritos",
      description: "👑 **ADMIN** — Estadísticas de carritos (abandonados, totales)."
    }
  });
}

fs.writeFileSync(filepath, JSON.stringify(doc, null, 2), 'utf8');
console.log('Postman collection updated successfully!');
