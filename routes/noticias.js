const express = require('express');

const db = require('../db');

const router = express.Router();

router.get('/noticias', async (req, res) => {
    try {
        const [noticias] = await db.query('SELECT * FROM noticias');

        const noticiasConImagenes = await Promise.all(noticias.map(async (noticia) => {
            const [imagenes] = await db.query(
                'SELECT path FROM noticias_imagenes WHERE id_noticia = ?',
                [noticia.id]
            );

            return {
                ...noticia,
                imagenes: imagenes.map(img => img.path) // Solo devuelve los paths de imágenes
            };
        }));

        res.json(noticiasConImagenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las noticias' });
    }
});

module.exports = router; // Exportar el router