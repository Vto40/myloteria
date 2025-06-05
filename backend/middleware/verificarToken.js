const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Decodifica el token y extrae el ID del usuario
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

module.exports = verificarToken;
