const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const routerAuth = express.Router();

// ─── Paso 1: redirige al usuario a Google ──────────────────────────────
// 🌍 Público
routerAuth.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ─── Paso 2: Google redirige de vuelta aquí ────────────────────────────
// 🌍 Público — callback de Google
routerAuth.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/failure",
    session: false,
  }),
  (req, res) => {
    // Generar JWT igual que el flujo normal de login
    const token = jwt.sign(
      { id: req.user.idCliente, role: req.user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN || "1d" }
    );

    // Redirigir al frontend con el token en la URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  }
);

// ─── Ruta de fallo de autenticación ───────────────────────────────────
// 🌍 Público
routerAuth.get("/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Autenticación con Google fallida",
  });
});

module.exports = routerAuth;
