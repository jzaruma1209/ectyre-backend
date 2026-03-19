const app = require("./app");
const { connection } = require("./utils/connection");

const PORT = process.env.PORT || 8080;

// Verificar si estamos en Vercel
if (process.env.VERCEL) {
  module.exports = app; // Para Vercel
} else {
  // Para desarrollo local
  const startServer = async () => {
    try {
      // Probar conexión a la base de datos
      await connection();
      console.log("✅ Conexión a PostgreSQL establecida");

      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        console.log(`📍 http://localhost:${PORT}`);
        console.log(`📚 API: http://localhost:${PORT}/api/v1`);
      });
    } catch (error) {
      console.error("❌ Error al iniciar servidor:", error);
      process.exit(1);
    }
  };

  startServer();
}
