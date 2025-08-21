const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajusta según tu conexión a MySQL
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        const [rows] = await db.query('SELECT * FROM noticias ORDER BY id DESC');
        res.json([rows]);
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        res.status(500).json({ error: 'Error al obtener noticias' });
    }
});

// 🔹 Agregar noticia
router.post('/agregar', upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, contenido } = req.body;
        const imagen = req.file ? `/uploads/noticias/${req.file.filename}` : null;
        const fecha = new Date();

        await db.query(`
            INSERT INTO noticias (titulo, contenido, imagen, fecha)
            VALUES (?, ?, ?, ?)
        `, [titulo, contenido, imagen, fecha]);

        res.json({ mensaje: 'Noticia agregada correctamente' });
    } catch (error) {
        console.error('Error al agregar noticia:', error);
        res.status(500).json({ error: 'Error al agregar noticia' });
    }
});

// 🔹 Editar noticia
router.post('/editar', upload.single('imagen'), async (req, res) => {
    try {
        const { id, titulo, contenido } = req.body;

        let query = 'UPDATE noticias SET titulo = ?, contenido = ?';
        const params = [titulo, contenido];

        if (req.file) {
            const imagen = `/uploads/noticias/${req.file.filename}`;
            query += ', imagen = ?';
            params.push(imagen);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        res.json({ mensaje: 'Noticia editada correctamente' });
    } catch (error) {
        console.error('Error al editar noticia:', error);
        res.status(500).json({ error: 'Error al editar noticia' });
    }
});

// 🔹 Eliminar noticia
router.post('/eliminar', async (req, res) => {
    try {
        const { id } = req.body;

        // Obtener imagen para eliminar del disco
        const [rows] = await db.query('SELECT imagen FROM noticias WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].imagen) {
            const filePath = path.join(__dirname, rows[0].imagen);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM noticias WHERE id = ?', [id]);
        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.status(500).json({ error: 'Error al eliminar noticia' });
    }
});

module.exports = router;
