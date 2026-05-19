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

    const origenesPermitidos = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://sgts.nazadoto.com",
        "https://nazadoto.com",
        "https://nazadoto.com:3500",
    ];

    const io = new Server(server, {
        cors: {
            origin(origin, callback) {
                if (!origin) return callback(null, true);
                if (origenesPermitidos.includes(origin)) return callback(null, true);
                if (/^https?:\/\/([a-z0-9-]+\.)?nazadoto\.com(:\d+)?$/i.test(origin)) {
                    return callback(null, true);
                }
                callback(new Error(`CORS socket no permitido: ${origin}`));
            },
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        },
    });

    // Guardar io en app para usarlo en rutas
    app.set("io", io);

    io.on("connection", (socket) => {
        socket.on("join_beneficiario", (dni) => {
            const normalizado = String(dni || "").trim();
            if (/^\d{7,8}$/.test(normalizado)) {
                socket.join(`beneficiario:${normalizado}`);
            }
        });
    });

    return server;
}

module.exports = configurarSocketIO;