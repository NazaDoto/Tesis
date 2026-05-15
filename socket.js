const http = require("http");
const { Server } = require("socket.io");
const https = require("https");
const fs = require("fs");

function configurarSocketIO(env, app) {
    let server;
    if (env === "dev") {
        server = http.createServer(app);
    } else {
        const cert = fs.readFileSync(
            "/etc/letsencrypt/live/nazadoto.com/fullchain.pem",
        );
        const key = fs.readFileSync(
            "/etc/letsencrypt/live/nazadoto.com/privkey.pem",
        );
        server = https.createServer({ key, cert }, app);
    }

    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:8080", "https://sgts.nazadoto.com"],
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        },
    });

    // Guardar io en app para usarlo en rutas
    app.set("io", io);

    return server;
}

module.exports = configurarSocketIO;