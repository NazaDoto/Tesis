const express = require('express');
const fs = require('fs');
const db = require('../db');
const path = require('path');
const router = express.Router();

/** Resuelve path bajo routes/uploads sin permitir salto de directorio. */
function resolveUploadFile(queryPath) {
  const uploadsDir = path.resolve(__dirname, 'uploads');
  let rel = String(queryPath || '').trim();
  if (!rel) return null;

  // Aceptar "/uploads/solicitudes/x.jpg", "uploads/solicitudes/x.jpg" o "solicitudes/x.jpg"
  rel = rel.replace(/^[\\/]+/, '');
  rel = rel.replace(/^uploads[\\/]/i, '');

  const abs = path.resolve(uploadsDir, rel);
  const relFromRoot = path.relative(uploadsDir, abs);
  if (!relFromRoot || relFromRoot.startsWith('..') || path.isAbsolute(relFromRoot)) {
    return null;
  }
  return abs;
}


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
  try {
    const abs = resolveUploadFile(req.query.path);
    if (!abs) {
      return res.status(400).json({ error: 'Ruta inválida' });
    }
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const base = path.basename(abs);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(base)}`);
    return res.sendFile(abs);
  } catch (err) {
    console.error('Error en /get/descargar:', err);
    return res.status(500).json({ error: 'Error al servir el archivo' });
  }
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