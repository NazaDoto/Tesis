const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Server = require('socket.io').Server;
const http = require('http');

//Definición de rutas
const authRoutes = require('./routes/auth');
const noticiasRoutes = require('./routes/noticias');
const getRoutes = require('./routes/get');
const beneficiariosRoutes = require('./routes/beneficiarios');
const tarjetasRoutes = require('./routes/tarjetas');

// Configurar variables de entorno
dotenv.config();



const app = express();
const port = process.env.PORT || 3500;


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // ajustalo a tu dominio del front
    }
});

// Middleware para exponer io en rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//Uso de rutas
app.use('/', noticiasRoutes);
app.use('/auth', authRoutes);
app.use('/get/', getRoutes);
app.use('/beneficiarios/', beneficiariosRoutes);
app.use('/tarjetas/', tarjetasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'routes', 'uploads')));


// Iniciar el servidor con Socket.IO
server.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
