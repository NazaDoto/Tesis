// utils/logger.js
const db = require("../db.js");

async function registrarLog(usuario, actividad, detalles) {
  try {

    await db.query(
      "INSERT INTO log (usuario, actividad, detalles) VALUES (?, ?, ?)",
      [usuario, actividad, detalles]
    );
  } catch (err) {
    console.error("Error registrando log:", err);
  }
}

module.exports = { registrarLog };
