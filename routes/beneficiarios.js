const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DBFFile } = require('dbffile');
const { registrarLog } = require('../utils/logger'); // 👈 importar logger

// Configuración de multer para guardar los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dni = req.body?.beneficiario ? JSON.parse(req.body.beneficiario).dni : 'desconocido';
      const dir = path.join(__dirname, './uploads/beneficiario', dni.toString());

      // Crear carpeta si no existe
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    } catch (err) {
      console.error('Error al crear carpeta de destino del archivo:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getFullYear());
  return `${anio}-${mes}-${dia}`;
}

router.get('/getDatos', async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.status(400).json({ error: 'DNI no proporcionado' });

  try {
    // 1. Buscar en la base de datos MySQL
    const [rows] = await db.query('SELECT * FROM beneficiario WHERE dni = ?', [dni]);
    const [rows2] = await db.query('SELECT * FROM tarjeta_soc WHERE dni = ?', [dni]);
    const [historial] = await db.execute(
      `SELECT observaciones, fecha 
             FROM historial_mov 
             WHERE dni = ? 
             ORDER BY fecha DESC`,
      [dni]
    );
    if (rows.length > 0) {
      const b = rows[0];
      const c = rows2[0];
      return res.json({
        dni: b.dni,
        nombre: b.nombre,
        fecha_nacimiento: formatearFecha(b.fecha_nacimiento),
        sexo: b.sexo,
        id_dpto: b.id_dpto,
        id_loc: b.id_loc,
        id_barrio: b.id_barrio,
        domicilio: b.domicilio,
        estado: c.estado || 'default',
        fecha_registro: formatearFecha(b.fecha_registro),
        hora_registro: b.hora_registro,
        fecha_modificacion: formatearFecha(b.fecha_modificacion),
        hora_modificacion: b.hora_modificacion,
        historias: historial.map(mov => ({
          observaciones: mov.observaciones,
          fecha: formatearFecha(mov.fecha),
        })),
        cant_parientes: b.cant_parientes,
        cuil: b.cuil,
        archivo: b.archivo_adjunto || null
      });
    }

    // 2. Buscar en ben_titu.dbf
    const benPath = path.join(__dirname, './padron/ben_titu.dbf');
    const benDBF = await DBFFile.open(benPath);
    const benRecords = await benDBF.readRecords();

    const ben = benRecords.find(r => String(r.DNI)?.trim() === String(dni));

    if (ben) {
      const nombre = ben.APEYNOM?.trim() || '';
      const fecha_nacimiento = ben.FNAC ? new Date(ben.FNAC).toISOString().split('T')[0] : '';
      const sexo = ben.SEXO?.toUpperCase() === 'F' ? 'F' : 'M';
      const domicilio = ben.DOMI?.trim() || '';
      const fecha_registro = ben.FECHA_REG ? new Date(ben.FECHA_REG).toISOString().split('T')[0] : '';
      const hora_registro = ben.HORA_REG || '';
      const fecha_modificacion = ben.FECHA_MOD ? new Date(ben.FECHA_MOD).toISOString().split('T')[0] : '';
      const hora_modificacion = ben.HORA_MOD || '';
      const cant_parientes = ben.CANT_PARE;
      const estado = ben.TS || null;

      const dpto_desc = ben.DPTO?.trim().toLowerCase() || '';
      const loc_desc = ben.LOC?.trim().toLowerCase() || '';
      const barrio_desc = ben.BARRIO?.trim().toLowerCase() || '';

      let id_dpto = null;
      let id_loc = null;
      let id_barrio = null;

      try {
        // Buscar id_dpto
        const [dptoRows] = await db.query(`
            SELECT id FROM departamento WHERE LOWER(TRIM(descripcion)) = ?
        `, [dpto_desc]);

        if (dptoRows.length > 0) {
          id_dpto = dptoRows[0].id_dpto;

          // Buscar id_loc
          const [locRows] = await db.query(`
                SELECT id FROM localidad 
                WHERE LOWER(TRIM(descripcion)) = ? AND id_dpto = ?
            `, [loc_desc, id_dpto]);

          if (locRows.length > 0) {
            id_loc = locRows[0].id_loc;

            // Buscar id_barrio
            const [barrioRows] = await db.query(`
                    SELECT id FROM barrio 
                    WHERE LOWER(TRIM(descripcion)) = ? AND id_loc = ?
                `, [barrio_desc, id_loc]);

            if (barrioRows.length > 0) {
              id_barrio = barrioRows[0].id_barrio;
            }
          }
        }
      } catch (error) {
        console.error("Error consultando departamento/localidad/barrio:", error);
      }

      return res.json({
        dni,
        nombre,
        fecha_nacimiento,
        sexo,
        domicilio,
        id_dpto,
        id_loc,
        id_barrio,
        estado,
        fecha_registro,
        hora_registro,
        fecha_modificacion,
        hora_modificacion,
        observaciones: '',
        cant_parientes,
        cuil: '', // No está en .dbf
      });
    }


    // 3. Buscar en padron_e.dbf
    const padronPath = path.join(__dirname, './padron/padron_e.dbf');
    const padronDBF = await DBFFile.open(padronPath);
    const padronRecords = await padronDBF.readRecords();

    const padron = padronRecords.find(r => {
      return String(r.NUM_DOC) === String(dni) || String(r.DNI) === String(dni);
    });

    if (padron) {
      return res.json({
        dni: dni,
        nombre: (padron.APEYNOM || `${padron.NOMBRE || ''} ${padron.APELLIDO || ''}`).trim(),
        fecha_nacimiento: '', // No se puede obtener de padron_e.dbf
        sexo: padron.GENERO?.charAt(0).toUpperCase() === 'F' ? 'F' : 'M',
        domicilio: padron.DOMI?.trim() || '',
        id_dpto: '',
        id_loc: '',
        id_barrio: '',
        estado: null,
        fecha_registro: '',
        hora_registro: '',
        fecha_modificacion: '',
        hora_modificacion: '',
        observaciones: '',
        cant_parientes: '',
        cuil: ''
      });
    }
    await registrarLog(req.user?.usuario || 'desconocido', "CONSULTA_BENEFICIARIO", `Consulta datos de DNI ${dni}`);

    return res.status(404).json({ error: 'DNI no encontrado en ninguna fuente' });

  } catch (err) {
    console.error('Error al obtener datos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/update', upload.single('archivo'), async (req, res) => {
  try {
    const { beneficiario, parientes, empleado } = req.body;
    const beneficiarioData = JSON.parse(beneficiario);
    const parientesArray = JSON.parse(parientes);
    const {
      dni,
      cuil,
      nombre,
      fecha_nacimiento,
      sexo,
      id_dpto,
      id_loc,
      id_barrio,
      domicilio,
      fecha_registro,
      hora_registro,
      estado,
      fecha_modificacion,
      hora_modificacion,
      observaciones,
      cant_parientes,
      importe,
      usuario,
    } = beneficiarioData;

    // Archivo adjunto
    if (req.file) {
      const relativePath = path.join(req.file.originalname);
      archivoNombre = relativePath.replace(/\\/g, '/'); // Para compatibilidad Windows/Linux

      // Guardar también en tabla de archivos, si corresponde
      const result = await db.query ('SELECT id FROM beneficiario WHERE dni = ?', [dni]);
      const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
      await db.query(`
    INSERT INTO archivo_beneficiario (id_beneficiario, dni, path)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE path = VALUES(path)
  `, [id_beneficiario, dni, archivoNombre]);
      // Insertar o actualizar en beneficiario
      await db.query(`
    INSERT into beneficiario (
      dni, cuil, nombre, fecha_nacimiento, sexo,
      id_dpto, id_loc, id_barrio, domicilio,
      fecha_registro, hora_registro, 
      fecha_modificacion, hora_modificacion, cant_parientes, archivo_adjunto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      cuil = VALUES(cuil),
      nombre = VALUES(nombre),
      fecha_nacimiento = VALUES(fecha_nacimiento),
      sexo = VALUES(sexo),
      id_dpto = VALUES(id_dpto),
      id_loc = VALUES(id_loc),
      id_barrio = VALUES(id_barrio),
      domicilio = VALUES(domicilio),
      fecha_registro = VALUES(fecha_registro),
      hora_registro = VALUES(hora_registro),
      fecha_modificacion = VALUES(fecha_modificacion),
      hora_modificacion = VALUES(hora_modificacion),
      cant_parientes = VALUES(cant_parientes),
      archivo_adjunto = VALUES(archivo_adjunto)
  `, [
        dni, cuil, nombre, fecha_nacimiento, sexo,
        id_dpto, id_loc, id_barrio, domicilio,
        fecha_registro, hora_registro,
        fecha_modificacion, hora_modificacion, cant_parientes, archivoNombre
      ]);
    } else {
      // Insertar o actualizar en beneficiario
      await db.query(`
        INSERT into beneficiario (
          dni, cuil, nombre, fecha_nacimiento, sexo,
          id_dpto, id_loc, id_barrio, domicilio,
          fecha_registro, hora_registro, 
          fecha_modificacion, hora_modificacion, cant_parientes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          cuil = VALUES(cuil),
          nombre = VALUES(nombre),
          fecha_nacimiento = VALUES(fecha_nacimiento),
          sexo = VALUES(sexo),
          id_dpto = VALUES(id_dpto),
          id_loc = VALUES(id_loc),
          id_barrio = VALUES(id_barrio),
          domicilio = VALUES(domicilio),
          fecha_registro = VALUES(fecha_registro),
          hora_registro = VALUES(hora_registro),
          fecha_modificacion = VALUES(fecha_modificacion),
          hora_modificacion = VALUES(hora_modificacion),
          cant_parientes = VALUES(cant_parientes)
      `, [
        dni, cuil, nombre, fecha_nacimiento, sexo,
        id_dpto, id_loc, id_barrio, domicilio,
        fecha_registro, hora_registro,
        fecha_modificacion, hora_modificacion, cant_parientes
      ]);

    }
    await registrarLog(empleado || 'desconocido', "ACTUALIZAR_BENEFICIARIO", `Se actualizó beneficiario DNI ${dni} (${nombre})`);


    const fechaHoy = new Date().toISOString().split('T')[0];
    const horaHoy = new Date().toTimeString().split(' ')[0].slice(0, 5);
    const result = await db.query(`SELECT id FROM beneficiario WHERE dni = ?`, [dni]);
    const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
    await db.query(`INSERT INTO tarjeta_soc(id_beneficiario, dni, fecha_registro, fecha_modificacion, estado, importe_acreditado) VALUES (?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
      fecha_modificacion = VALUES(fecha_modificacion),
      estado = VALUES(estado),
      importe_acreditado = VALUES(importe_acreditado)`, [id_beneficiario,dni, fechaHoy, fechaHoy, estado, importe])
    await db.query(`INSERT INTO historial_mov(id_beneficiario,observaciones, fecha, dni) VALUES (?,?, ?, ?)`, [id_beneficiario,observaciones ? observaciones : 'ACTUALIZACIÓN DE BENEFICIARIO', fechaHoy, dni])

    // Eliminar parientes anteriores
    await db.query(`DELETE FROM PARIENTE WHERE dni_titular = ?`, [dni]);

    // Insertar nuevos parientes

    for (const p of parientesArray) {
      if (p.dni && p.nombre) {
        const result = await db.query(`SELECT id FROM beneficiario WHERE dni = ?`, [p.dni]);
        const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
        await db.query(`
          insert into pariente (
            id_beneficiario, dni_titular, dni_pariente, nombre_pariente,
            fecha_nacimiento, sexo,
            fecha_registro,  
            fecha_modificacion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id_beneficiario,
          dni,
          p.dni,
          p.nombre,
          p.fecha_nacimiento || null,
          p.sexo || null,
          fechaHoy,
          fechaHoy,
        ]);
        await registrarLog(empleado || 'desconocido', "INSERTAR_PARIENTE", `Beneficiario DNI ${dni}, Pariente: ${p.nombre} (${p.dni})`);

      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error en /beneficiario/update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//quitarArchivo
router.delete('/quitarArchivo', async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.status(400).json({ error: 'DNI no proporcionado' });

  try {
    // Obtener archivo de la base
    const [archivos] = await db.query(
      `SELECT path FROM archivo_beneficiario WHERE dni = ?`,
      [dni]
    );

    if (archivos.length === 0) {
      return res.status(404).json({ error: 'No se encontró archivo asociado al DNI' });
    }

    const archivoPath = path.join(__dirname, '..', archivos[0].path);

    // Eliminar físicamente el archivo
    if (fs.existsSync(archivoPath)) {
      fs.unlinkSync(archivoPath);
    }

    // Eliminar de la tabla archivo_beneficiario
    await db.query(
      `DELETE FROM archivo_beneficiario WHERE dni = ?`,
      [dni]
    );

    // Limpiar campo archivo_adjunto en la tabla beneficiario
    await db.query(
      `UPDATE beneficiario SET archivo_adjunto = NULL WHERE dni = ?`,
      [dni]
    );
    await registrarLog(req.user?.usuario || 'desconocido', "ELIMINAR_ARCHIVO", `Se eliminó archivo adjunto del DNI ${dni}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ success: false, error: 'Error interno al eliminar archivo' });
  }
});

router.get('/verificarTarjeta', async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.status(400).json({ error: 'DNI no proporcionado' });

  try {
    // 1. Buscar en MySQL
    const [rows] = await db.query('SELECT estado FROM tarjeta_soc WHERE dni = ?', [dni]);
    if (rows.length > 0) {
      return res.json({ estado: rows[0].estado || null });
    }

    // 2. Buscar en ben_titu.dbf
    const benPath = path.join(__dirname, './padron/ben_titu.dbf');
    const benDBF = await DBFFile.open(benPath);
    const benRecords = await benDBF.readRecords();

    const ben = benRecords.find(r => String(r.DNI)?.trim() === String(dni));
    if (ben) {
      return res.json({ estado: ben.TS || null });
    }

    // Si no se encontró en ninguna fuente
    return res.status(404).json({ error: 'Tarjeta no encontrada' });

  } catch (err) {
    console.error('Error al verificar tarjeta:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/getDatosPadron', async (req, res) => {
  const dni = req.query.dni;
  try {
    // 3. Buscar en padron_e.dbf
    const padronPath = path.join(__dirname, './padron/padron_e.dbf');
    const padronDBF = await DBFFile.open(padronPath);
    const padronRecords = await padronDBF.readRecords();

    const padron = padronRecords.find(r => {
      return String(r.NUM_DOC) === String(dni) || String(r.DNI) === String(dni);
    });

    if (padron) {
      return res.json({
        dni: dni,
        nombre: (padron.APEYNOM || `${padron.NOMBRE || ''} ${padron.APELLIDO || ''}`).trim(),
        sexo: padron.GENERO?.charAt(0).toUpperCase() === 'F' ? 'F' : 'M',
        domicilio: padron.DOMI?.trim() || ''
      });
    } else {
      res.status(404).send('No se encontró en el padrón.');
    }
  } catch (error) {
    console.log(error)
  }
})
// POST /beneficiario/updateUsuario
router.post('/updateUsuario', async (req, res) => {
  const { id, usuario, correo, rol, dni } = req.body.usuario;
    const empleado = req.body.empleado || 'desconocido';

  if (!id) {
    return res.status(400).json({ error: "Falta el ID del usuario" });
  }

  const sql = `
        UPDATE usuario
        SET usuario = ?, correo = ?, rol = ?, dni = ?
        WHERE id = ?`;
  try {
    await db.query(sql, [usuario, correo, rol, dni, id]);
    await registrarLog(req.user?.usuario || 'desconocido', "ACTUALIZAR_USUARIO", `Se actualizó usuario ID ${id}, usuario=${usuario}`);

    res.json({ success: true, message: "Usuario actualizado correctamente" });

  } catch (error) {
    return res.status(500).json({ error: "Error al actualizar usuario", details: error.message });

  }
});

module.exports = router;
