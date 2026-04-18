const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Cliente } = require("../models");

// ─── Estrategia Google OAuth 2.0 ─────────────────────────────────────
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

        // Buscar por googleId primero
        let cliente = await Cliente.findOne({ where: { googleId: profile.id } });

        if (!cliente) {
          // Si no existe por googleId, buscar por email (ya registrado manualmente)
          cliente = await Cliente.findOne({ where: { email } });

          if (cliente) {
            // Usuario existente — vincular googleId a su cuenta
            await cliente.update({ googleId: profile.id });
          } else {
            // Usuario nuevo — crear desde Google
            // tipoIdentificacion y numeroIdentificacion son requeridos en el modelo.
            // Se asignan valores por defecto que el usuario puede actualizar luego.
            cliente = await Cliente.create({
              googleId: profile.id,
              nombres: profile.name.givenName || "Google",
              apellidos: profile.name.familyName || "User",
              email,
              telefono: "0000000000",
              tipoIdentificacion: "PASAPORTE",
              numeroIdentificacion: `GOOGLE_${profile.id}`,
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

// Serialize/Deserialize para sesión de Passport
passport.serializeUser((cliente, done) => done(null, cliente.idCliente));
passport.deserializeUser(async (id, done) => {
  try {
    const cliente = await Cliente.findByPk(id);
    done(null, cliente);
  } catch (err) {
    done(err, null);
  }
});
