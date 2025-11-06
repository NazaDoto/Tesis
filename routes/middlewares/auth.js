// middlewares/auth.js
const jwt = require('jsonwebtoken');
const db = require('../../db');

const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {

    // Verificar firma y expiración del JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // guardar info del usuario para uso posterior
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verificarToken;
