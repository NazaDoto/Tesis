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

/** Borra entradas de log que referencian nombres de usuario (FK log → usuario). */
async function eliminarLogsPorUsuarios(conn, nombresUsuario) {
  const lista = (nombresUsuario || []).map((u) => String(u || "").trim()).filter(Boolean);
  if (lista.length === 0) return;

  const placeholders = lista.map(() => "?").join(", ");
  await conn.execute(`DELETE FROM log WHERE usuario IN (${placeholders})`, lista);
}

module.exports = { registrarLog, eliminarLogsPorUsuarios };
