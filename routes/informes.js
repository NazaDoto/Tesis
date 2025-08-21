const express = require('express');
const db = require("../db.js"); // conexión MySQL
const router = express.Router();

// Mapear nombres de departamento a cod_dpto
const departamentosMap = {
  capital: 7,
  banda: 5,
};

// Función para construir cláusula WHERE según tipo
function getWhereClause(tipo) {
  if (tipo === "todo") return ""; // sin filtro
  if (tipo === "interior") return "WHERE b.cod_dpto NOT IN (5,7)"; // todos menos banda y capital
  if (departamentosMap[tipo]) return `WHERE b.cod_dpto = ${departamentosMap[tipo]}`;
  return "";
}

// ================== BENEFICIARIOS ==================
router.get("/beneficiarios/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    const where = getWhereClause(tipo);

    const [rows] = await db.query(
      `SELECT 
          b.dni, 
          b.nombre, 
          b.fecha_nacimiento, 
          b.sexo, 
          b.cod_dpto, 
          d.descripcion AS departamento,
          b.cod_localidad, 
          b.cod_barrio, 
          b.domicilio, 
          b.fecha_registro, 
          b.hora_registro, 
          b.fecha_modificacion, 
          b.hora_modificacion, 
          b.cant_parientes, 
          b.cuil, 
          b.telefono
       FROM beneficiarios b
       LEFT JOIN departamentos d ON b.cod_dpto = d.cod_dpto
       ${where}
       ORDER BY b.dni`
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
      `SELECT 
          t.dni AS dni_beneficiario,
          b.nombre, 
          b.fecha_nacimiento, 
          b.sexo,
          b.cod_dpto, 
          d.descripcion AS departamento,
          b.cod_localidad, 
          b.cod_barrio, 
          b.domicilio, 
          b.fecha_registro AS fecha_registro_benef,
          b.hora_registro, 
          b.fecha_modificacion AS fecha_modif_benef,
          b.hora_modificacion, 
          b.cant_parientes, 
          b.cuil, 
          b.telefono,
          t.num_tarjeta, 
          t.fecha_registro AS fecha_registro_tarjeta, 
          t.estado, 
          t.fecha_modificacion AS fecha_modif_tarjeta, 
          t.importe_acreditado, 
          t.num_cuenta
       FROM tarjetas_soc t
       INNER JOIN beneficiarios b ON t.dni = b.dni
       LEFT JOIN departamentos d ON b.cod_dpto = d.cod_dpto
       ${where}
       ORDER BY t.num_tarjeta`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tarjetas sociales" });
  }
});

module.exports = router;
