const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { registrarLog } = require('../utils/logger'); // 👈 importar el logger

const router = express.Router();

// ================== LOGIN ==================
router.post('/login', async (req, res) => {
    const { usuario, contraseña } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
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
        await db.query(
            'INSERT INTO usuarios (usuario, contraseña, fecha_registro, correo, dni) VALUES (?, ?, ?, ?, ?)',
            [usuario, hashedPassword, fechaRegistro, correo, dni]
        );

        await registrarLog(usuario, "REGISTRO", `Usuario ${usuario} registrado con dni ${dni}`); // log registro
        res.json('Registro correcto.');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.sqlState == '23000') {
            res.status(500).json({ message: 'Ya existe un usuario con este usuario/dni.' });
        } else {
            res.status(500).json({ message: 'Error al crear usuario. ', error });
        }
    }
});
router.post('/cambiarContrasena', async (req, res) => {
    const { usuario, contraseñaActual, contraseñaNueva } = req.body;

    try {
        // Buscar usuario
        const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
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
        await db.query('UPDATE usuarios SET contraseña = ? WHERE usuario = ?', [hashedPassword, usuario]);

        // Insertar log
        await db.query(
            'INSERT INTO logs (usuario, actividad, detalles, ip, user_agent) VALUES (?, ?, ?, ?, ?)',
            [
              usuario,
              'CAMBIO_CONTRASEÑA',
              `El usuario ${usuario} cambió su contraseña`
            ]
        );

        res.json({ message: 'Contraseña cambiada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error al cambiar contraseña.' });
    }
});

module.exports = router;
