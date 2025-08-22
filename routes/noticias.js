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
    FROM noticias n
    LEFT JOIN noticias_imagenes ni ON n.id = ni.id_noticia
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
            FROM noticias n
            LEFT JOIN noticias_imagenes ni ON ni.id_noticia = n.id
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
        const { titulo, contenido } = req.body;
        const imagen = req.file ? `/uploads/noticias/${req.file.filename}` : null;
        // 1️⃣ Insertar noticia (solo titulo, contenido y fecha)
        const fecha = new Date();
        const [result] = await db.query(`
    INSERT INTO noticias (titulo, contenido, fecha)
    VALUES (?, ?, ?)
`, [titulo, contenido, fecha]);

        // 2️⃣ Insertar imagen asociada en noticias_imagenes (si existe)
        if (req.file) {
            const pathImagen = `/uploads/noticias/${req.file.filename}`;
            const idNoticia = result.insertId; // id generado de la noticia
            await db.query(`
        INSERT INTO noticias_imagenes (path, id_noticia)
        VALUES (?, ?)
    `, [pathImagen, idNoticia]);
        }
        await registrarLog(req.user?.usuario || 'desconocido', "CREAR_NOTICIA", `Se creó noticia '${titulo}' (ID ${result.insertId})`, req);

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
        await registrarLog(req.user?.usuario || 'desconocido', "EDITAR_NOTICIA", `Se editó noticia ID ${id}, nuevo título='${titulo}'`, req);

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
        await registrarLog(req.user?.usuario || 'desconocido', "ELIMINAR_NOTICIA", `Se eliminó noticia ID ${id}`, req);

        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        res.status(500).json({ error: 'Error al eliminar noticia' });
    }
});

module.exports = router;
