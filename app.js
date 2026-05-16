const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const configurarSocketIO = require('./socket');

//Definición de rutas
const authRoutes = require('./routes/auth');
const noticiasRoutes = require('./routes/noticias');
const informesRoutes = require('./routes/informes');
const getRoutes = require('./routes/get');
const beneficiariosRoutes = require('./routes/beneficiarios');
const tarjetasRoutes = require('./routes/tarjetas');
const verificarToken = require('./routes/middlewares/auth');

// Configurar variables de entorno
dotenv.config();



const app = express();
const port = process.env.PORT || 3500;
const env = 'prod';




app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware global para verificar token, excluyendo ciertas rutas
const rutasExentasExactas = [
    '/auth/login',
    '/auth/register',
    '/noticias/get',
    '/favicon.ico',
];

const rutasExentasRegex = [
    /^\/noticias\/getNoticia\/.+$/,
    /^\/uploads\/noticias\/.+$/   // cualquier archivo dentro de /uploads/noticias/
];

app.use((req, res, next) => {
    const path = req.path;

    // Si coincide exactamente con alguna ruta exenta
    if (rutasExentasExactas.includes(path)) return next();

    // Si coincide con alguna regex de rutas exentas
    if (rutasExentasRegex.some(re => re.test(path))) return next();

    // Si no es ruta exenta, verificar token
    verificarToken(req, res, next);
});



app.use('/auth', authRoutes);
app.use('/get/', getRoutes);
app.use('/beneficiarios/', beneficiariosRoutes);
app.use('/tarjetas/', tarjetasRoutes);
app.use('/noticias/', noticiasRoutes);
app.use('/informes/', informesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'routes', 'uploads')));
// Después de todas las rutas API
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Integrar Socket.IO y iniciar el servidor
const server = configurarSocketIO(env, app);
server.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
