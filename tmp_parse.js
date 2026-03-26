const fs = require('fs');
const path = require('path');
try {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'Ectyre_API_Postman_Collection.json'), 'utf8'));
  const routes = [];
  
  function extractRoutes(items) {
    if (!items) return;
    items.forEach(item => {
      if (item.request && item.request.url) {
        let urlStr = '';
        if (typeof item.request.url === 'string') {
          urlStr = item.request.url;
        } else if (item.request.url.raw) {
          urlStr = item.request.url.raw;
        }
        routes.push({ name: item.name, method: item.request.method, url: urlStr.replace(/\{\{[a-zA-Z_]+\}\}/g, '') });
      }
      if (item.item) {
        extractRoutes(item.item);
      }
    });
  }
  
  extractRoutes(data.item);
  console.log('Total endpoints in collection: ' + routes.length);
  routes.forEach(r => console.log(`${r.method} ${r.url} - ${r.name}`));
} catch(e) {
  console.error("Error parsing:", e);
}
