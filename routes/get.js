const express = require('express');
const db = require('../db');
const path = require('path');
const router = express.Router();


router.get('/departamentos', async (req, res) => {
  try {
    const response = await db.query('SELECT * FROM departamento ORDER BY descripcion ASC');
    res.json(response[0]);
  } catch (error) {
    console.log('No se pudo obtener los departamentos. ', error);
    res.status(500);
  }
});

router.get('/localidades', async (req, res) => {
  const { id_dpto } = req.query;
  console.log(id_dpto)
  try {
    const [rows] =
      await db.query('SELECT id, descripcion FROM localidad WHERE id_dpto = ? ORDER BY descripcion',
        [id_dpto]);
        res.json(rows);
  } catch (err) { console.error(err); res.status(500).send('Error al obtener localidades'); }
});

router.get('/barrios', async (req, res) => {
  const { id_localidad } = req.query;
  try {
    const [rows] =
      await db.query('SELECT id, descripcion FROM barrio WHERE id_loc = ? ORDER BY descripcion', [id_localidad]); res.json(rows);
  } catch (err) { console.error(err); res.status(500).send('Error al obtener barrios'); }
});

router.get('/descargar', (req, res) => {
  const filePath = path.join(__dirname, req.query.path);
  res.download(filePath);
});


router.get('/usuarios', async (req, res) => {
  try {
    const result = await db.query('SELECT id, usuario, fecha_registro, correo, rol, dni FROM usuario');
    return res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
});
// ================== LOGS ==================
router.get("/log", async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, usuario, actividad } = req.query;

    let query = `
      SELECT 
        id,
        usuario,
        actividad,
        detalles,
        fecha
      FROM log
      WHERE 1=1
    `;
    const params = [];

    // Filtros dinámicos
    if (fecha_desde) {
      query += " AND fecha >= ?";
      params.push(fecha_desde + " 00:00:00");
    }
    if (fecha_hasta) {
      query += " AND fecha <= ?";
      params.push(fecha_hasta + " 23:59:59");
    }
    if (usuario) {
      query += " AND usuario LIKE ?";
      params.push("%" + usuario + "%");
    }
    if (actividad) {
      query += " AND actividad LIKE ?";
      params.push("%" + actividad + "%");
    }

    query += " ORDER BY fecha DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener logs:", err);
    res.status(500).json({ error: "Error al obtener logs" });
  }
});


module.exports = router; // Exportar el router