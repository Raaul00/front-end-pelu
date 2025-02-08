// utils/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";

// Creem la cookie de sessió
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // Nom de la cookie
    httpOnly: true, // Per seguretat, només accessible des del servidor
    secure: process.env.NODE_ENV === "production", // Només segura en prod
    secrets: ["una-clau-secreta"], // Per signar les cookies (posar una més segura)
    sameSite: "lax", // Evita problemes de CSRF
    path: "/", // Disponible a tota l'app
    maxAge: 60 * 60 * 24 * 7, // 1 setmana
  },
});
