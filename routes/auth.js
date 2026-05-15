const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { registrarLog } = require('../utils/logger'); // 👈 importar el logger
const path = require('path');
const { DBFFile } = require('dbffile');
const router = express.Router();


function toMySQLDate(fecha) {
  if (!fecha) return null; // si no viene nada
  
  // Si ya es un objeto Date, convertir directamente
  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }

  // Si es string tipo '5/10/2009' o '06/10/09'
  if (typeof fecha === 'string' && fecha.includes('/')) {
    const [dia, mes, anio] = fecha.split('/');
    const fullYear = anio.length === 2 ? `20${anio}` : anio;
    return `${fullYear}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  // Si ya viene en formato correcto (YYYY-MM-DD), devolver tal cual
  return fecha;
}


// ================== LOGIN ==================
router.post('/login', async (req, res) => {
    const { usuario, contraseña } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE usuario = ?', [usuario]);
        if (rows.length === 0) {
            await registrarLog(usuario, "LOGIN_FALLIDO", "Usuario no encontrado"); // log fallo
            return res.status(500).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!isValidPassword) {
            await registrarLog(usuario, "LOGIN_FALLIDO", "Contraseña incorrecta"); // log fallo
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const rol = user.rol;
        const dni = user.dni;
        const token = jwt.sign({ usuario: user.usuario }, process.env.SECRET_KEY, { expiresIn: '1h' });

        await registrarLog(usuario, "LOGIN_EXITOSO", `Usuario ${usuario} inició sesión`); // log éxito
        res.json({ token, rol, dni });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// ================== REGISTER ==================
router.post('/register', async (req, res) => {
    const { usuario, contraseña, correo, dni } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const fechaRegistro = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
        // 1. Insertar usuario
        const [result] = await db.query(
            'INSERT INTO usuario (usuario, contraseña, fecha_registro, correo, dni) VALUES (?, ?, ?, ?, ?)',
            [usuario, hashedPassword, fechaRegistro, correo, dni]
        );


        // 2. Buscar beneficiario en MySQL
        const [benefRows] = await db.query('SELECT * FROM beneficiario WHERE dni = ?', [dni]);

        if (benefRows.length > 0) {
            // Existe beneficiario en MySQL, actualizar usuario
            await db.query('UPDATE beneficiario SET usuario = ? WHERE dni = ?', [usuario, dni]);
        } else {
            // Buscar en ben_titu.dbf
            const benPath = path.join(__dirname, './padron/ben_titu.dbf');
            const benDBF = await DBFFile.open(benPath);
            const benRecords = await benDBF.readRecords();
            const ben = benRecords.find(r => String(r.DNI)?.trim() === String(dni));

            if (ben) {
                // Opcional: puedes agregar lógica para id_dpto, id_loc, id_barrio aquí
                const [result] = await db.query(
                    `INSERT INTO beneficiario 
                    (dni, nombre, fecha_nacimiento, sexo, domicilio, cant_parientes, usuario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        dni,
                        ben.APEYNOM?.trim() || '',
                        ben.FNAC ? new Date(ben.FNAC).toISOString().split('T')[0] : null,
                        ben.SEXO?.toUpperCase() === 'F' ? 'F' : 'M',
                        ben.DOMI?.trim() || '',
                        ben.CANT_PARE || 0,
                        usuario
                    ]
                );
                const id_beneficiario = result.insertId;
                await db.execute(
                    `INSERT INTO tarjeta_soc 
                 (id_beneficiario, dni, num_cuenta, num_tarjeta, fecha_registro, estado, fecha_modificacion, importe_acreditado)
                 VALUES (?,?, ?, ?, ?, ?, ?, ?)`,
                    [id_beneficiario, dni, ben.NUMRUSUAR, ben.NUM_TAR, toMySQLDate(ben.FECHA_REG), ben.TS,
                        toMySQLDate(ben.FECHA_MOD), ben.TOT_IMP || 0]
                );
            }
        }

        // 3. Log de registro
        await registrarLog(usuario, "REGISTRO", `Usuario ${usuario} registrado con dni ${dni}`);

        res.json('Registro correcto.');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.sqlState === '23000') {
            res.status(500).json({ message: 'Ya existe un usuario con este usuario/dni.' });
        } else {
            res.status(500).json({ message: 'Error al crear usuario.', error });
        }
    }
});

router.post('/cambiarContrasena', async (req, res) => {
    const { usuario, contraseñaActual, contraseñaNueva } = req.body;

    try {
        // Buscar usuario
        const [rows] = await db.query('SELECT * FROM usuario WHERE usuario = ?', [usuario]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = rows[0];

        // Validar contraseña actual
        const isValidPassword = await bcrypt.compare(contraseñaActual, user.contraseña);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(contraseñaNueva, 10);

        // Actualizar en BD
        await db.query('UPDATE usuario SET contraseña = ? WHERE usuario = ?', [hashedPassword, usuario]);

        // 3. Log de registro
        await registrarLog(usuario, "CAMBIO DE CONTRASEÑA", `Usuario ${usuario} cambió su contraseña.`);


        res.json({ message: 'Contraseña cambiada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña.' });
    }
});

module.exports = router;
