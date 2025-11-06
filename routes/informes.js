const express = require('express');
const db = require("../db.js"); // conexión MySQL
const router = express.Router();

// Mapear nombres de departamento a id_dpto
const departamentosMap = {
  capital: 7,
  banda: 5,
};

// Función para construir cláusula WHERE según tipo
function getWhereClause(tipo) {
  if (tipo === "todo") return ""; // sin filtro
  if (tipo === "interior") return "WHERE b.id_dpto NOT IN (5,7)"; // todos menos banda y capital
  if (departamentosMap[tipo]) return `WHERE b.id_dpto = ${departamentosMap[tipo]}`;
  return "";
}

// ================== BENEFICIARIOS ==================
router.get("/beneficiarios/:tipo", async (req, res) => {
  try {
    const tipo = req.params.tipo;
    const whereBase = getWhereClause(tipo);

    const { fecha_desde, fecha_hasta } = req.query;

    let filtros = [];
    if (whereBase) filtros.push(whereBase.replace("WHERE", "").trim());
    if (fecha_desde) filtros.push(`b.fecha_registro >= '${fecha_desde}'`);
    if (fecha_hasta) filtros.push(`b.fecha_registro <= '${fecha_hasta}'`);

    const whereFinal = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const [rows] = await db.query(
      `SELECT 
          b.dni, 
          b.nombre, 
          b.fecha_nacimiento, 
          b.sexo, 
          b.id_dpto, 
          d.descripcion AS departamento,
          b.id_loc, 
          l.descripcion AS localidad,
          b.id_barrio, 
          br.descripcion AS barrio,
          b.domicilio, 
          b.fecha_registro, 
          b.hora_registro, 
          b.fecha_modificacion, 
          b.hora_modificacion, 
          b.cant_parientes, 
          b.cuil, 
          b.telefono
       FROM beneficiario b
       LEFT JOIN departamento d ON b.id_dpto = d.id
       LEFT JOIN localidad l ON b.id_loc = l.id
       LEFT JOIN barrio br ON b.id_barrio = br.id
       ${whereFinal}
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
    const whereBase = getWhereClause(tipo);

    const { fecha_desde, fecha_hasta, estado } = req.query;

    let filtros = [];
    if (whereBase) filtros.push(whereBase.replace("WHERE", "").trim());
    if (fecha_desde) filtros.push(`t.fecha_registro >= '${fecha_desde}'`);
    if (fecha_hasta) filtros.push(`t.fecha_registro <= '${fecha_hasta}'`);
    if (estado) filtros.push(`t.estado = '${estado}'`);

    const whereFinal = filtros.length > 0 ? "WHERE " + filtros.join(" AND ") : "";

    const [rows] = await db.query(
      `SELECT 
          t.dni AS dni_beneficiario,
          b.nombre, 
          b.fecha_nacimiento, 
          b.sexo,
          b.id_dpto, 
          d.descripcion AS departamento,
          b.id_loc, 
          l.descripcion AS localidad,
          b.id_barrio, 
          br.descripcion AS barrio,
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
       FROM tarjeta_soc t
       INNER JOIN beneficiario b ON t.dni = b.dni
       LEFT JOIN departamento d ON b.id_dpto = d.id
       LEFT JOIN localidad l ON b.id_loc = l.id
       LEFT JOIN barrio br ON b.id_barrio = br.id
       ${whereFinal}
       ORDER BY t.num_tarjeta`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tarjetas sociales" });
  }
});

module.exports = router;
