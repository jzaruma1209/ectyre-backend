const passport = require("passport");
const { Cliente } = require("../models");

// Solo registrar Google OAuth si las credenciales están configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const displayName = profile.displayName || email;

          // Separar displayName en nombres / apellidos (ej: "Juan Pérez" → nombres: "Juan", apellidos: "Pérez")
          const parts = displayName.split(" ");
          const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(" ");
          const apellidos =
            parts.slice(Math.ceil(parts.length / 2)).join(" ") || nombres;

          // Buscar por googleId primero; si no existe, buscar por email para vincular
          let cliente = await Cliente.findOne({ where: { googleId: profile.id } });

          if (!cliente) {
            // Intentar vincular a una cuenta existente por email
            cliente = await Cliente.findOne({ where: { email } });

            if (cliente) {
              // Vincular cuenta existente con Google
              await cliente.update({ googleId: profile.id });
            } else {
              // Crear nueva cuenta Google — campos obligatorios con valores por defecto
              cliente = await Cliente.create({
                googleId: profile.id,
                nombres,
                apellidos,
                email,
                // tipoIdentificacion y numeroIdentificacion son obligatorios en el modelo —
                // se usan valores temporales; el cliente puede actualizarlos desde /perfil
                tipoIdentificacion: "CEDULA",
                numeroIdentificacion: `G-${profile.id}`.substring(0, 20),
                telefono: "0000000000",
                passwordHash: null,
                role: "cliente",
                activo: true,
              });
            }
          }

          return done(null, cliente);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

passport.serializeUser((cliente, done) => done(null, cliente.idCliente));

passport.deserializeUser(async (id, done) => {
  try {
    const cliente = await Cliente.findByPk(id);
    done(null, cliente);
  } catch (err) {
    done(err, null);
  }
});
