// utils/logger.js
const db = require("../db.js");

async function registrarLog(usuario, actividad, detalles, req) {
  try {
    const ip = req.ip || null;
    const userAgent = req.headers["user-agent"] || null;

    await db.query(
      "INSERT INTO logs (usuario, actividad, detalles, ip, user_agent) VALUES (?, ?, ?, ?, ?)",
      [usuario, actividad, detalles, ip, userAgent]
    );
  } catch (err) {
    console.error("Error registrando log:", err);
  }
}

module.exports = { registrarLog };
