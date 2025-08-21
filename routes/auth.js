const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Ruta para el registro de usuarios


// Ruta para el inicio de sesión de usuarios
router.post('/login', async (req, res) => {
    const { usuario, contraseña } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
        if (rows.length === 0) {
            return res.status(500).json({ message: 'Usuario o contraseña incorrectos.' });
        }
        const user = rows[0];
        const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }
        const rol = user.rol;
        const dni = user.dni;
        const token = jwt.sign({ usuario: user.usuario }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, rol, dni});
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token no válido' });
    }
};

// Ruta protegida de ejemplo
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Acceso autorizado' });
});


router.post('/register', async (req, res) => {
    const { usuario, contraseña, correo, dni } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const fechaRegistro = new Date().toISOString().slice(0, 19).replace("T", " ");
    try {
        await db.query('INSERT INTO usuarios (usuario, contraseña, fecha_registro, correo, dni) VALUES (?, ?, ?, ?, ?)', [usuario, hashedPassword, fechaRegistro, correo, dni]);
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
module.exports = router; // Exportar el router