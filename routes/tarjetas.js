const express = require('express');
const router = express.Router();
const db = require('../db'); // tu conexión MySQL
const path = require('path');
const { DBFFile } = require('dbffile');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
// Carpeta destino para archivos
const uploadPath = path.join(__dirname, 'uploads/solicitudes');

// Asegurarse que la carpeta exista
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = `${req.body.dni}-${file.fieldname}${ext}`;
        cb(null, nombre);
    }
});

// Filtros opcionales para validar tipo mime
const fileFilter = (req, file, cb) => {
    // Aceptar solo pdf, jpg, png
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido'));
    }
};

const upload = multer({ storage, fileFilter });


function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear());
    return `${anio}-${mes}-${dia}`;
}
const transporter = nodemailer.createTransport({
    host: 'mail.complejojfi.gob.ar',
    port: 25,
    secure: false,
    auth: {
        user: process.env.MAIL_ACC,
        pass: process.env.MAIL_PW,
    },
    tls: {
        rejectUnauthorized: false
    }
});
// GET /tarjetas/getDatos?dni=12345678
router.get('/getDatos', async (req, res) => {
    const dni = req.query.dni;

    if (!dni) return res.status(400).json({ error: 'DNI requerido' });

    try {
        // 1. Buscar en MySQL
        const [rows] = await db.execute(
            `SELECT 
    dni, 
    CONCAT('XXXX-XXXX-XXXX-', RIGHT(LPAD(num_cuenta, 16, '0'), 4)) AS num_cuenta,
    CONCAT('XXXX-XXXX-XXXX-', RIGHT(LPAD(num_tarjeta, 16, '0'), 4)) AS num_tarjeta,
    fecha_registro, 
    estado, 
    fecha_modificacion, 
    importe_acreditado
FROM tarjetas_soc 
WHERE dni = ?;`,
            [dni]
        );

        if (rows.length > 0) {
            const b = rows[0];

            // Buscar historial de movimientos
            const [historial] = await db.execute(
                `SELECT observaciones, fecha 
         FROM historial_mov 
         WHERE dni = ? 
         ORDER BY fecha DESC`,
                [dni]
            );

            return res.json({
                dni: b.dni,
                num_cuenta: b.num_cuenta,
                num_tarjeta: b.num_tarjeta,
                fecha_registro: formatearFecha(b.fecha_registro),
                estado: b.estado,
                fecha_modificacion: formatearFecha(b.fecha_modificacion),
                importe_acreditado: b.importe_acreditado,
                historias: historial.map(mov => ({
                    observaciones: mov.observaciones,
                    fecha: formatearFecha(mov.fecha),
                }))
            });
        }


        // 2. Buscar en ben_titu.dbf
        const dbfPath = path.join(__dirname, './padron/ben_titu.dbf');
        const dbf = await DBFFile.open(dbfPath);
        const records = await dbf.readRecords();

        const registro = records.find(r => String(r.DNI)?.trim() === String(dni));

        if (registro) {
            return res.json({
                dni: dni,
                num_cuenta: registro.NUMRUSUAR || '',
                num_tarjeta: registro.NUM_TAR || '',
                fecha_registro: registro.FECHA_REG ? new Date(registro.FECHA_REG).toLocaleDateString('es-AR') : '',
                estado: registro.TS,
                fecha_modificacion: registro.FECHA_MOD ? new Date(registro.FECHA_MOD).toLocaleDateString('es-AR') : '',
                importe_acreditado: registro.TOT_IMP || 0,
                historial: registro.OBSERV || ''
            });
        }

        // Si no se encuentra en ningún lado
        res.json({});
    } catch (err) {
        console.error('Error en /tarjetas/getDatos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
router.post('/update', async (req, res) => {
    const {
        dni,
        num_cuenta,
        num_tarjeta,
        fecha_registro,
        estado,
        fecha_modificacion,
        importe_acreditado,
        observaciones
    } = req.body;

    if (!dni || !num_cuenta) {
        return res.status(400).json({ error: 'DNI y número de cuenta son obligatorios.' });
    }

    try {
        // Buscar tarjeta actual
        const [rows] = await db.execute(
            'SELECT * FROM tarjetas_soc WHERE dni = ? AND num_cuenta = ?',
            [dni, num_cuenta]
        );

        let estadoAnterior = null;
        let observacion = '';
        const fechaHoy = new Date().toISOString().split('T')[0];

        if (rows.length > 0) {
            estadoAnterior = rows[0].estado;

            // Actualizar tarjeta
            await db.execute(
                `UPDATE tarjetas_soc SET
                  num_tarjeta = ?,
                  fecha_registro = ?,
                  estado = ?,
                  fecha_modificacion = ?,
                  importe_acreditado = ?
                WHERE dni = ? AND num_cuenta = ?`,
                [num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado, dni, num_cuenta]
            );

            observacion = (estadoAnterior !== estado)
                ? `ACTUALIZACIÓN DE DATOS DE TARJETA. Estado: ${estadoAnterior} pasa a ${estado}. ${observaciones}`
                : `ACTUALIZACIÓN DE DATOS DE TARJETA (sin cambio de estado). ${observaciones}`;

            await db.query(
                `INSERT INTO historial_mov (dni, observaciones, fecha)
                 VALUES (?, ?, ?)`,
                [dni, observacion, fechaHoy]
            );

        } else {
            // Insertar nueva tarjeta
            await db.execute(
                `INSERT INTO tarjetas_soc 
                 (dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado]
            );

            observacion = `ALTA DE DATOS DE TARJETA. ${observaciones}`;

            await db.query(
                `INSERT INTO historial_mov(dni, observaciones, fecha) 
                 VALUES (?, ?, ?)`,
                [dni, observacion, fechaHoy]
            );
        }

        // 🔔 Enviar correo si hubo cambio de estado
        if (estadoAnterior && estadoAnterior !== estado) {
            // Buscar correo del beneficiario
            const [userRows] = await db.execute(
                'SELECT correo, nombre FROM usuarios WHERE dni = ?',
                [dni]
            );

            if (userRows.length > 0) {
                const { correo, nombre } = userRows[0];

                const mailOptions = {
                    from: '"Notificaciones MDS" <notificaciones@mdssde.gob.ar>',
                    to: correo,
                    subject: `Notificación de cambio de estado de Tarjeta Social`,
                    html: `
                        <div style="box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2); background-color: white; padding: 1cm 2.5cm 5px 2.5cm;">
                            <div id="notificacion">
                                <div style="margin-top: 5px; text-align: center;">
                                    <h3>Estimado/a ${nombre},</h3>
                                    <p>Le informamos que el estado de su Tarjeta Social ha cambiado:</p>
                                    <p><b>${estadoAnterior} ➝ ${estado}</b></p>
                                    <p>${observaciones || ''}</p>
                                </div>
                                <hr />
                                <div style="font-size: 14px; margin-top: 16px;color: #888;">
                                    Ministerio de Desarrollo Social - Santiago del Estero
                                </div>
                            </div>
                        </div>
                    `
                };

                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Correo enviado:', info.messageId);
                } catch (emailErr) {
                    console.error('Error al enviar correo:', emailErr);
                }
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error en /tarjetas/update:', err);
        res.status(500).json({ error: 'Error al guardar la tarjeta' });
    }
});
router.post('/solicitar', upload.fields([
    { name: 'dni', maxCount: 1 },
    { name: 'historial', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            dni, nombre, fecha_nacimiento, sexo, telefono, departamento, localidad, barrio,
            domicilio, cant_parientes, usuario, cuil
        } = req.body;

        // Parientes llega como JSON string, parsearlo
        const parientes = JSON.parse(req.body.parientes || '[]');

        const fechaHoy = new Date();
        const fecha = fechaHoy.toISOString().slice(0, 10);
        const hora = fechaHoy.toTimeString().slice(0, 8);

        // Obtener paths de archivos guardados
        const pathDni = req.files['dni'] ? `/uploads/solicitudes/${req.files['dni'][0].filename}` : null;
        const pathHistorial = req.files['historial'] ? `/uploads/solicitudes/${req.files['historial'][0].filename}` : null;

        // 1. Insertar en beneficiarios (incluyendo archivo_adjunto que será pathDni)
        await db.query(`
      INSERT into beneficiarios (
        dni, nombre, fecha_nacimiento, sexo, telefono, cod_dpto, cod_localidad, cod_barrio,
        domicilio, fecha_registro, hora_registro, fecha_modificacion, hora_modificacion,
        cant_parientes, usuario, cuil
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            dni,
            nombre,
            fecha_nacimiento,
            sexo,
            telefono,
            departamento,
            localidad,
            barrio,
            domicilio,
            fecha,
            hora,
            fecha,
            hora,
            cant_parientes,
            usuario || null,
            cuil
        ]);

        // 2. Insertar parientes
        if (parientes.length > 0) {
            for (const pariente of parientes) {
                await db.query(`
            insert into parientes (
              dni_titular, dni_pariente, nombre_pariente, fecha_nacimiento, sexo,
              fecha_registro, fecha_modificacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
                    dni,
                    pariente.dni_pariente,
                    pariente.nombre_pariente,
                    pariente.fecha_nacimiento_pariente,
                    pariente.sexo_pariente,
                    fecha,
                    fecha
                ]);
            }
        }

        // 3. Insertar en solicitudes (con paths)
        await db.query(`
      INSERT INTO solicitudes (
        dni, fecha_solicitud, path_dni, path_historial_medico
      ) VALUES (?, ?, ?, ?)
    `, [
            dni,
            fecha,
            pathDni,
            pathHistorial
        ]);

        // 4. Inicializar tarjeta
        await db.query(`
      INSERT INTO tarjetas_soc (
        dni, fecha_registro, estado
      ) VALUES (?, ?, ?)
    `, [
            dni,
            fecha,
            'PENDIENTE'
        ]);

        await db.query(`INSERT INTO historial_mov(dni, observaciones, fecha) VALUES (?, ?, ?)`, [dni, 'SOLICITUD DE TARJETA', fechaHoy])

        // 🔔 Emitir evento a empleados
        const io = req.app.get('io'); // <--- esto obtiene la instancia de Socket.IO
        io.emit("nueva_solicitud", {
            dni,
            nombre,
            fecha
        });
        res.json({ mensaje: 'Solicitud registrada correctamente con archivos' });
    } catch (error) {
        console.error('Error en /solicitar:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});
router.get('/getSolicitud', async (req, res) => {
    const { dni } = req.query;

    if (!dni) {
        return res.status(400).json({ error: 'Falta el parámetro dni' });
    }

    try {
        // 1. Estado de la tarjeta
        const [tarjetaRows] = await db.query(
            'SELECT estado FROM tarjetas_soc WHERE dni = ? LIMIT 1',
            [dni]
        );

        // 2. Fecha de solicitud
        const [solicitudRows] = await db.query(
            'SELECT id, fecha_solicitud FROM solicitudes WHERE dni = ? LIMIT 1',
            [dni]
        );

        // 3. Observaciones e historial
        const [historialRows] = await db.query(
            'SELECT observaciones, fecha FROM historial_mov WHERE dni = ? ORDER BY fecha DESC',
            [dni]
        );

        res.json({
            id: solicitudRows.length ? solicitudRows[0].id : null,
            estado: tarjetaRows.length ? tarjetaRows[0].estado : null,
            fecha_solicitud: solicitudRows.length ? solicitudRows[0].fecha_solicitud : null,
            historial: historialRows
        });
    } catch (error) {
        console.error('Error en /getSolicitud:', error);
        res.status(500).json({ error: 'No se pudo obtener la solicitud' });
    }
});

router.get('/getSolicitudes', async (req, res) => {
    try {
        const response = await db.query(`
  SELECT s.*, t.estado AS estado
  FROM solicitudes s
  LEFT JOIN tarjetas_soc t ON s.dni = t.dni
`); res.json(response);
    } catch (error) {
        res.status(500);
    }
})

router.post('/actualizarSolicitud', async (req, res) => {
    try {
        const { form } = req.body.params; // obtenemos el form del front
        const { id, dni, estado, observacion } = form;

        // 1. Obtener estado actual de tarjetas_soc
        const [tarjetaActual] = await db.query(
            'SELECT estado FROM tarjetas_soc WHERE dni = ?',
            [dni]
        );

        if (!tarjetaActual.length) {
            return res.status(404).json({ error: 'Tarjeta no encontrada' });
        }

        const estadoViejo = tarjetaActual[0].estado;

        // 2. Actualizar estado solo si cambió
        if (estado !== 'default' && estado !== estadoViejo) {
            await db.query(
                'UPDATE tarjetas_soc SET estado = ?, fecha_modificacion = NOW() WHERE dni = ?',
                [estado, dni]
            );
        }

        // 3. Crear observación para historial_mov
        let observacionFinal = '';
        if (estado !== 'default' && estado !== estadoViejo) {
            observacionFinal += `ACTUALIZACIÓN DE SOLICITUD: ${estadoViejo} -> ${estado}`;
        }
        if (observacion && observacion.trim() !== '') {
            if (observacionFinal) observacionFinal += ' | ';
            observacionFinal += observacion;
        }

        // 4. Insertar en historial_mov solo si hay algo que registrar
        if (observacionFinal) {
            await db.query(
                'INSERT INTO historial_mov (dni, observaciones, fecha) VALUES (?, ?, NOW())',
                [dni, observacionFinal]
            );
        }

        // 5. 🔔 Enviar correo si hubo cambio de estado
        if (estado !== 'default' && estado !== estadoViejo) {
            const [userRows] = await db.query(
                'SELECT correo FROM usuarios WHERE dni = ?',
                [dni]
            );

            if (userRows.length > 0) {
                const { correo } = userRows[0];

                const mailOptions = {
                    from: '"Notificaciones MDS" <notificaciones@mdssde.gob.ar>',
                    to: correo,
                    subject: 'Notificación de cambio en su Solicitud de Tarjeta Social',
                    html: `
                        <div style="box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2); background-color: white; padding: 1cm 2.5cm 5px 2.5cm;">
                            <div id="notificacion">
                                <div style="margin-top: 5px; text-align: center;">
                                    <h3>Estimado/a,</h3>
                                    <p>Le informamos que el estado de su solicitud de Tarjeta Social ha cambiado:</p>
                                    <p><b>${estadoViejo} ➝ ${estado}</b></p>
                                    ${observacion ? `<p><i>${observacion}</i></p>` : ''}
                                </div>
                                <hr />
                                <div style="font-size: 14px; margin-top: 16px;color: #888;">
                                    Ministerio de Desarrollo Social - Santiago del Estero
                                </div>
                            </div>
                        </div>
                    `
                };

                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Correo enviado:', info.messageId);
                } catch (emailErr) {
                    console.error('Error al enviar correo:', emailErr);
                }
            }
        }

        res.json({ mensaje: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ error: 'No se pudo actualizar la solicitud' });
    }
});

module.exports = router;
