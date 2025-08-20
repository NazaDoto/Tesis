const express = require('express');
const db = require('../db');
const path = require('path');
const router = express.Router();


router.get('/departamentos', async (req, res) => {
    try {
        const response = await db.query('SELECT * FROM departamentos ORDER BY descripcion ASC');
        res.json(response[0]);
    } catch (error) {
        console.log('No se pudo obtener los departamentos. ', error);
        res.status(500);
    }
});

router.get('/localidades/:cod_dpto', async (req, res) => {
    const { cod_dpto } = req.params;
    try {
        const response = await db.query(
            'SELECT * FROM localidades WHERE cod_dpto = ? ORDER BY descripcion ASC',
            [cod_dpto]
        );
        res.json(response[0]);
    } catch (error) {
        console.log('No se pudo obtener las localidades. ', error);
        res.status(500);
    }
});

router.get('/barrios/:cod_localidad', async (req, res) => {
    try {
        const { cod_localidad } = req.params;
        const response = await db.query(
            'SELECT * FROM barrios WHERE cod_localidad = ? ORDER BY descripcion ASC',
            [cod_localidad]
        );
        res.json(response[0]);
    } catch (error) {
        console.log('No se pudo obtener los barrios', error);
        res.status(500);
    }
});

router.get('/descargar', (req, res) => {
    const filePath = path.join(__dirname, req.query.path);
    res.download(filePath);
});


router.get('/usuarios', async (req, res) => {
    try {
        const result = await db.query('SELECT id, usuario, fecha_registro, correo, rol, dni FROM usuarios');
        return res.json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
});
module.exports = router; // Exportar el router