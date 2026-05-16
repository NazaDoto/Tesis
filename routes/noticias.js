const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajusta según tu conexión a MySQL
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { registrarLog } = require('../utils/logger'); // 👈 importar logger

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'uploads/noticias');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const nombre = `${Date.now()}${ext}`;
        cb(null, nombre);
    }
});
const upload = multer({ storage });

// 🔹 Listar todas las noticias
router.get('/get', async (req, res) => {
    try {
        const [rows] = await db.query(`
    SELECT n.id, n.titulo, n.contenido, n.fecha, ni.path AS imagen
    FROM noticia n
    LEFT JOIN noticia_imagen ni ON n.id = ni.id_noticia
    ORDER BY n.id DESC
`);
        res.json([rows]);
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        res.status(500).json({ error: 'Error al obtener noticias' });
    }
});


// Obtener una noticia por ID
router.get('/getNoticia/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Traer noticia y su imagen principal (si hay)
        const [rows] = await db.query(`
            SELECT n.id, n.titulo, n.contenido, n.fecha, ni.path AS imagen
            FROM noticia n
            LEFT JOIN noticia_imagen ni ON ni.id_noticia = n.id
            WHERE n.id = ?
            ORDER BY ni.id ASC
            LIMIT 1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }

        res.json(rows[0]); // Devolver un objeto con la noticia
    } catch (error) {
        console.error('Error al obtener noticia:', error);
        res.status(500).json({ error: 'Error al obtener noticia' });
    }
});

// 🔹 Agregar noticia
router.post('/agregar', upload.single('imagen'), async (req, res) => {

    try {
        const { titulo, contenido, empleado } = req.body;
        const imagen = req.file ? `/uploads/noticias/${req.file.filename}` : null;
        // 1️⃣ Insertar noticia (solo titulo, contenido y fecha)
        const fecha = new Date();
        const resultEmpleado = await db.query('SELECT id FROM usuario WHERE usuario = ?', [empleado]);
        const empleadId = resultEmpleado[0].length > 0 ? resultEmpleado[0][0].id : null;
        const [result] = await db.query(`
    INSERT INTO noticia (usuario, titulo, contenido, fecha)
    VALUES (?, ?, ?, ?)
`, [empleadId, titulo, contenido, fecha]);

        // 2️⃣ Insertar imagen asociada en noticias_imagenes (si existe)
        if (req.file) {
            const pathImagen = `/uploads/noticias/${req.file.filename}`;
            const idNoticia = result.insertId; // id generado de la noticia
            await db.query(`
        INSERT INTO noticia_imagen (path, id_noticia)
        VALUES (?, ?)
    `, [pathImagen, idNoticia]);
        }
        await registrarLog(empleado || 'desconocido', "CREAR_NOTICIA", `Se creó noticia '${titulo}' (ID ${result.insertId})`);

        res.json({ mensaje: 'Noticia agregada correctamente' });
    } catch (error) {
        console.error('Error al agregar noticia:', error);
        res.status(500).json({ error: 'Error al agregar noticia' });
    }
});

// 🔹 Editar noticia
router.post('/editar', upload.single('imagen'), async (req, res) => {

    try {
        const { titulo, contenido, empleado, id } = req.body;
        const idNoticia = parseInt(id, 10);
        if (!idNoticia || Number.isNaN(idNoticia)) {
            return res.status(400).json({ error: 'ID de noticia inválido' });
        }

        let query = 'UPDATE noticia SET titulo = ?, contenido = ?';
        const params = [titulo, contenido];

        if (req.file) {
            const imagen = `/uploads/noticias/${req.file.filename}`;
            await db.query(`
        UPDATE noticia_imagen SET path = ? WHERE id_noticia = ?
    `, [imagen, idNoticia]);
        }

        query += ' WHERE id = ?';
        params.push(idNoticia);

        await db.query(query, params);
        await registrarLog(empleado || 'desconocido', "EDITAR_NOTICIA", `Se editó noticia ID ${idNoticia}, nuevo título='${titulo}'`);

        res.json({ mensaje: 'Noticia editada correctamente' });
    } catch (error) {
        console.error('Error al editar noticia:', error);
        res.status(500).json({ error: 'Error al editar noticia' });
    }
});

// 🔹 Eliminar noticia
router.post('/eliminar', async (req, res) => {

    try {
        const { id, empleado } = req.body;

        // Obtener imagen para eliminar del disco
        const [rows] = await db.query('SELECT path FROM noticia_imagen WHERE id_noticia = ?', [id]);
        if (rows.length > 0 && rows[0].path) {
            const filePath = path.join(__dirname, rows[0].path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await db.query('DELETE FROM noticia_imagen WHERE id_noticia = ?', [id]);
        await db.query('DELETE FROM noticia WHERE id = ?', [id]);
        await registrarLog(empleado || 'desconocido', "ELIMINAR_NOTICIA", `Se eliminó noticia ID ${id}`);

        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.status(500).json({ error: 'Error al eliminar noticia' });
    }
});

module.exports = router;
