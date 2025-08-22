// utils/logger.js
const db = require("../db.js");

async function registrarLog(usuario, actividad, detalles) {
  try {

    await db.query(
      "INSERT INTO logs (usuario, actividad, detalles, ip, user_agent) VALUES (?, ?, ?, ?, ?)",
      [usuario, actividad, detalles]
    );
  } catch (err) {
    console.error("Error registrando log:", err);
  }
}

module.exports = { registrarLog };
