const http = require('http'); // Necesario para Socket.IO
const { Server } = require('socket.io'); // Socket.IO
const https = require('https');
const fs = require('fs');

const usuariosConectados = new Map();

/**
 * Configura y gestiona los eventos de Socket.IO
 * @param {String} env - Si está en producción o desarrollo
 * @param {Object} app - La instancia de Express
 */
function configurarSocketIO(env, app) {
    let server;
    if (env == 'dev') {
        // Crear servidor HTTP
        server = http.createServer(app);

    } else {
        const key = fs.readFileSync('/var/www/ssl/nazadoto.com.key');
        const cert = fs.readFileSync('/var/www/ssl/nazadoto.com.crt');
        
        server = https.createServer({ key, cert }, app);
    }
    
    // Integrar Socket.IO con el servidor HTTP
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:8080', 'https://sgts.nazadoto.com'], // Permite conexiones de cualquier origen
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'], // Encabezados permitidos
            credentials: true, // Permitir credenciales
        },
    });
    return server; // Retornar el servidor HTTP para iniciar la app
}

module.exports = configurarSocketIO;
