const express = require('express');
const router = express.Router();
const db = require('../db'); // tu conexión MySQL
const path = require('path');
const { DBFFile } = require('dbffile');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const { registrarLog } = require('../utils/logger'); // 👈 importar logger

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

/** Valor enmascarado tipo XXXX-XXXX-XXXX-1234 (no sirve para UPDATE). */
function esValorEnmascarado(valor) {
    if (valor === null || valor === undefined || valor === '') return true;
    const s = String(valor).trim();
    return /^X{4}[-\s]?X{4}[-\s]?X{4}[-\s]?/i.test(s);
}

function valorNumericoTarjeta(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).trim();
}

function normalizarFecha(fecha) {
    if (!fecha) {
        return new Date().toISOString().split('T')[0];
    }
    const s = String(fecha).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        return s.slice(0, 10);
    }
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
        let anio = m[3];
        if (anio.length === 2) anio = `20${anio}`;
        return `${anio}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
}

function enmascararNumero(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    const s = String(valor).replace(/\D/g, '');
    if (!s) return String(valor);
    return `XXXX-XXXX-XXXX-${s.slice(-4)}`;
}

async function obtenerTarjetaPorDni(dni) {
    const [rows] = await db.execute(
        'SELECT * FROM tarjeta_soc WHERE dni = ? ORDER BY fecha_modificacion DESC, id DESC LIMIT 1',
        [dni]
    );
    return rows.length > 0 ? rows[0] : null;
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
    const vistaEmpleado = req.query.empleado === '1' || req.query.empleado === 'true';

    if (!dni) return res.status(400).json({ error: 'DNI requerido' });

    try {
        // 1. Buscar en MySQL (última tarjeta del DNI)
        const [rows] = await db.execute(
            `SELECT dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado
             FROM tarjeta_soc WHERE dni = ?
             ORDER BY fecha_modificacion DESC, id DESC LIMIT 1`,
            [dni]
        );

        if (rows.length > 0) {
            const b = rows[0];
            const cuentaDb = valorNumericoTarjeta(b.num_cuenta);
            const tarjetaDb = valorNumericoTarjeta(b.num_tarjeta);

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
                num_cuenta: vistaEmpleado ? cuentaDb : enmascararNumero(cuentaDb),
                num_tarjeta: vistaEmpleado ? tarjetaDb : enmascararNumero(tarjetaDb),
                num_cuenta_real: cuentaDb,
                num_tarjeta_real: tarjetaDb,
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
            const cuenta = registro.NUMRUSUAR || '';
            const tarjeta = registro.NUM_TAR || '';
            return res.json({
                dni: dni,
                num_cuenta: cuenta,
                num_tarjeta: tarjeta,
                num_cuenta_real: cuenta,
                num_tarjeta_real: tarjeta,
                fecha_registro: registro.FECHA_REG ? new Date(registro.FECHA_REG).toLocaleDateString('es-AR') : '',
                estado: registro.TS,
                fecha_modificacion: registro.FECHA_MOD ? new Date(registro.FECHA_MOD).toLocaleDateString('es-AR') : '',
                importe_acreditado: registro.TOT_IMP || 0,
                historias: [{ fecha: formatearFecha(registro.FECHA_MOD), observaciones: registro.OBSERV }] || ''
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

    let {
        dni,
        num_cuenta,
        num_tarjeta,
        fecha_registro,
        estado,
        fecha_modificacion,
        importe_acreditado,
        observaciones,
        empleado
    } = req.body;

    dni = String(dni || '').trim();
    if (!dni) {
        return res.status(400).json({ error: 'El DNI es obligatorio.' });
    }

    if (!estado || estado === 'default') {
        return res.status(400).json({ error: 'Seleccione un estado de tarjeta válido.' });
    }

    fecha_registro = normalizarFecha(fecha_registro);
    fecha_modificacion = normalizarFecha(fecha_modificacion);

    try {
        let accion = "ACTUALIZAR_TARJETA";
        let rows = [];

        const tarjetaPorDni = await obtenerTarjetaPorDni(dni);
        let cuentaAnterior = null;

        if (tarjetaPorDni) {
            cuentaAnterior = tarjetaPorDni.num_cuenta;
            rows = [tarjetaPorDni];

            if (!esValorEnmascarado(num_cuenta) && String(num_cuenta).trim()) {
                num_cuenta = String(num_cuenta).trim();
            } else {
                num_cuenta = tarjetaPorDni.num_cuenta;
            }

            if (!esValorEnmascarado(num_tarjeta)) {
                num_tarjeta = String(num_tarjeta ?? '').trim() || tarjetaPorDni.num_tarjeta;
            } else {
                num_tarjeta = tarjetaPorDni.num_tarjeta;
            }
        } else if (!esValorEnmascarado(num_cuenta) && String(num_cuenta).trim()) {
            [rows] = await db.execute(
                'SELECT * FROM tarjeta_soc WHERE dni = ? AND num_cuenta = ?',
                [dni, String(num_cuenta).trim()]
            );
            if (rows.length > 0) {
                num_cuenta = rows[0].num_cuenta;
                if (esValorEnmascarado(num_tarjeta)) {
                    num_tarjeta = rows[0].num_tarjeta;
                }
            } else {
                num_cuenta = String(num_cuenta).trim();
                if (esValorEnmascarado(num_tarjeta)) {
                    num_tarjeta = num_tarjeta || '';
                }
            }
        } else {
            return res.status(400).json({
                error: 'No hay tarjeta en el sistema para este DNI. Pulse "Comprobar en padrón" y, si corresponde, realice el alta con los datos del padrón.',
            });
        }

        if (!num_cuenta || !String(num_cuenta).trim()) {
            return res.status(400).json({ error: 'El número de cuenta es obligatorio.' });
        }

        let estadoAnterior = null;
        let observacion = '';
        const fechaHoy = new Date().toISOString().split('T')[0];

        if (rows.length > 0) {
            estadoAnterior = rows[0].estado;
            const cuentaWhere = cuentaAnterior || rows[0].num_cuenta;
            const cambios = [];
            if (String(cuentaWhere) !== String(num_cuenta)) {
                cambios.push(`Cuenta: ${cuentaWhere} → ${num_cuenta}`);
            }
            if (String(rows[0].num_tarjeta || '') !== String(num_tarjeta || '')) {
                cambios.push(`Tarjeta: ${rows[0].num_tarjeta || '(vacía)'} → ${num_tarjeta || '(vacía)'}`);
            }

            await db.execute(
                `UPDATE tarjeta_soc SET
                  num_cuenta = ?,
                  num_tarjeta = ?,
                  fecha_registro = ?,
                  estado = ?,
                  fecha_modificacion = ?,
                  importe_acreditado = ?
                WHERE dni = ? AND num_cuenta = ?`,
                [num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado, dni, cuentaWhere]
            );

            const detalleCambios = cambios.length ? ` ${cambios.join('. ')}.` : '';
            observacion = (estadoAnterior !== estado)
                ? `ACTUALIZACIÓN DE DATOS DE TARJETA. Estado: ${estadoAnterior} pasa a ${estado}.${detalleCambios} ${observaciones}`
                : `ACTUALIZACIÓN DE DATOS DE TARJETA (sin cambio de estado).${detalleCambios} ${observaciones}`;
            const result = await db.query(`SELECT id FROM beneficiario WHERE dni = ?`, [dni]);
            const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
            await db.query(
                `INSERT INTO historial_mov(id_beneficiario,observaciones, fecha, dni) VALUES (?,?, ?, ?)`, [id_beneficiario, observacion, fechaHoy, dni]
            );

        } else {
            accion = "ALTA_TARJETA";

            // Insertar nueva tarjeta
            const result = await db.query(`SELECT id FROM beneficiario WHERE dni = ?`, [dni]);
            const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
            await db.execute(
                `INSERT INTO tarjeta_soc 
                 (id_beneficiario, dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado)
                 VALUES (?,?, ?, ?, ?, ?, ?, ?)`,
                [id_beneficiario, dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado]
            );

            observacion = `ALTA DE DATOS DE TARJETA. ${observaciones}`;

            await db.query(
                `INSERT INTO historial_mov(id_beneficiario,observaciones, fecha, dni) VALUES (?,?, ?, ?)`, [id_beneficiario, observacion, fechaHoy, dni]
            );
        }
        await registrarLog(empleado || 'desconocido', accion, `Gestión tarjeta DNI ${dni} - Cuenta ${num_cuenta}`);

        // 🔔 Enviar correo si hubo cambio de estado
        if (estadoAnterior && estadoAnterior !== estado) {
            // Buscar correo del beneficiario
            const [userRows] = await db.execute(
                'SELECT correo FROM usuario WHERE dni = ?',
                [dni]
            );

            if (userRows.length > 0) {
                const { correo } = userRows[0];

                const mailOptions = {
                    from: '"Notificaciones MDS" <notificaciones@mdssde.gob.ar>',
                    to: correo,
                    subject: `Notificación de cambio de estado de Tarjeta Social`,
                    html: `
                        <div style="box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2); background-color: white; padding: 1cm 2.5cm 5px 2.5cm;">
                            <div id="notificacion">
                                <div style="margin-top: 5px; text-align: center;">
                                    <h3>Estimado/a,</h3>
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
            domicilio, cant_parientes, usuario, cuil, empleado
        } = req.body;

        const parientes = JSON.parse(req.body.parientes || '[]');

        const fechaHoy = new Date();
        const fecha = fechaHoy.toISOString().slice(0, 10);
        const hora = fechaHoy.toTimeString().slice(0, 8);

        const pathDni = req.files['dni']
            ? `/uploads/solicitudes/${req.files['dni'][0].filename}`
            : null;

        const pathHistorial = req.files['historial']
            ? `/uploads/solicitudes/${req.files['historial'][0].filename}`
            : null;

        // 1. Insertar beneficiario
        const [insertBeneficiario] = await db.query(`
            INSERT INTO beneficiario (
                dni, nombre, fecha_nacimiento, sexo, telefono, id_dpto, id_loc, id_barrio,
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

        // ID del beneficiario recién insertado
        const id_beneficiario = insertBeneficiario.insertId;

        await registrarLog(
            empleado || 'desconocido',
            "SOLICITUD_TARJETA",
            `Nueva solicitud tarjeta DNI ${dni} - Nombre: ${nombre}`
        );

        // 2. Insertar parientes
        if (parientes.length > 0) {
            for (const pariente of parientes) {
                await db.query(`
                    INSERT INTO pariente (
                        id_beneficiario, dni_titular, dni_pariente, nombre_pariente,
                        fecha_nacimiento, sexo, fecha_registro, fecha_modificacion
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    id_beneficiario,
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

        // 3. Insertar solicitud
        await db.query(`
            INSERT INTO solicitud (
                id_beneficiario, dni, fecha_solicitud, path_dni, path_historial_medico
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            id_beneficiario,
            dni,
            fecha,
            pathDni,
            pathHistorial
        ]);

        // 4. Inicializar tarjeta
        await db.query(`
            INSERT INTO tarjeta_soc (
                id_beneficiario, dni, fecha_registro, estado
            ) VALUES (?, ?, ?, ?)
        `, [
            id_beneficiario,
            dni,
            fecha,
            'PENDIENTE'
        ]);

        // 5. Historial
        await db.query(`
            INSERT INTO historial_mov (
                id_beneficiario, observaciones, fecha, dni
            ) VALUES (?, ?, ?, ?)
        `, [
            id_beneficiario,
            'SOLICITUD DE TARJETA',
            fecha,
            dni
        ]);

        // 6. Notificación a empleados
        const io = req.app.get('io');

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
            'SELECT estado FROM tarjeta_soc WHERE dni = ? LIMIT 1',
            [dni]
        );

        // 2. Fecha de solicitud
        const [solicitudRows] = await db.query(
            'SELECT id, fecha_solicitud FROM solicitud WHERE dni = ? LIMIT 1',
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
  FROM solicitud s
  LEFT JOIN tarjeta_soc t ON s.dni = t.dni
`); res.json(response);
    } catch (error) {
        res.status(500);
    }
})

router.post('/actualizarSolicitud', async (req, res) => {
    try {
        const form = req.body?.form ?? req.body?.params?.form;
        if (!form) {
            return res.status(400).json({ error: 'Formulario requerido' });
        }
        const { id, dni, estado, observacion } = form;

        // 1. Obtener estado actual de tarjeta_soc
        const [tarjetaActual] = await db.query(
            'SELECT estado FROM tarjeta_soc WHERE dni = ?',
            [dni]
        );

        if (!tarjetaActual.length) {
            return res.status(404).json({ error: 'Tarjeta no encontrada' });
        }

        const estadoViejo = tarjetaActual[0].estado;

        // 2. Actualizar estado solo si cambió
        if (estado !== 'default' && estado !== estadoViejo) {
            await db.query(
                'UPDATE tarjeta_soc SET estado = ?, fecha_modificacion = NOW() WHERE dni = ?',
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
            const result = await db.query(`SELECT id FROM beneficiario WHERE dni = ?`, [dni]);
            const id_beneficiario = result[0].length > 0 ? result[0][0].id : null;
            const fechaHoy = new Date().toISOString().slice(0, 10);
            await db.query(
                `INSERT INTO historial_mov (id_beneficiario,observaciones, fecha, dni) VALUES (?,?, ?, ?)`, [id_beneficiario, observacionFinal, fechaHoy, dni]
            );
        }

        // 5. 🔔 Enviar correo si hubo cambio de estado
        if (estado !== 'default' && estado !== estadoViejo) {
            const [userRows] = await db.query(
                'SELECT correo FROM usuario WHERE dni = ?',
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
        await registrarLog(req.user?.usuario || 'desconocido', "ACTUALIZAR_SOLICITUD", `Actualización solicitud tarjeta DNI ${dni} - Nuevo estado: ${estado} - Obs: ${observacion}`);

        const estadoFinal =
            estado !== 'default' && estado !== estadoViejo ? estado : estadoViejo;

        const io = req.app.get('io');
        if (io) {
            io.to(`beneficiario:${dni}`).emit('solicitud_actualizada', {
                dni: String(dni),
                estado: estadoFinal,
                estadoAnterior: estadoViejo,
                observacion: observacion || null,
                huboCambioEstado: estado !== 'default' && estado !== estadoViejo,
            });
        }

        res.json({ mensaje: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ error: 'No se pudo actualizar la solicitud' });
    }
});

module.exports = router;
