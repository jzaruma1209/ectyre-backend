// ─── Caché pública en el CDN de Vercel ──────────────────────────────
// Solo para lecturas públicas del catálogo: el CDN responde sin ejecutar la función
// y revalida en segundo plano. Los cambios del panel tardan hasta `segundos` en verse.

/**
 * Marca como cacheables las respuestas GET exitosas (200).
 * Los errores no se cachean porque el encabezado se agrega solo al responder 200.
 * @param {number} [segundos=60] Tiempo que el CDN sirve la respuesta sin revalidar.
 */
const cachePublica = (segundos = 60) => (req, res, next) => {
  if (req.method !== "GET") return next();
  const jsonOriginal = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      res.set("Cache-Control", `public, max-age=0, s-maxage=${segundos}, stale-while-revalidate=300`);
    }
    return jsonOriginal(body);
  };
  next();
};

module.exports = { cachePublica };
