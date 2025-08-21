const express = require('express');
const db = require("../db.js"); // tu conexión a la DB

const router = express.Router();

// Mapear nombres de departamento a cod_dpto
const departamentosMap = {
  capital: 7,
  banda: 5,
};

// Función para construir cláusula WHERE según tipo
function getWhereClause(tipo) {
  if (tipo === "todo") return ""; // sin filtro
  if (tipo === "interior") return "WHERE cod_dpto NOT IN (5,7)"; // todos menos banda y capital
  if (departamentosMap[tipo]) return `WHERE cod_dpto = ${departamentosMap[tipo]}`;
  return "";
}

// ================== BENEFICIARIOS ==================
router.get("/beneficiarios/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    const where = getWhereClause(tipo);

    const [rows] = await db.query(
      `SELECT b.id, b.nombre, b.apellido, b.dni, b.cod_dpto, d.descripcion as departamento
       FROM beneficiarios b
       LEFT JOIN departamentos d ON b.cod_dpto = d.cod_dpto
       ${where}
       ORDER BY b.id`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener beneficiarios" });
  }
});

// ================== TARJETAS SOCIALES ==================
router.get("/tarjetas/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    const where = getWhereClause(tipo);

    const [rows] = await db.query(
      `SELECT t.id as tarjeta_id, t.numero as nro_tarjeta, t.estado, 
              b.id as beneficiario_id, b.nombre, b.apellido, b.dni, b.cod_dpto,
              d.descripcion as departamento
       FROM tarjetas t
       INNER JOIN beneficiarios b ON t.id_beneficiario = b.id
       LEFT JOIN departamentos d ON b.cod_dpto = d.cod_dpto
       ${where}
       ORDER BY t.id`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tarjetas" });
  }
});

module.exports = router;
