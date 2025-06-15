const express = require('express');
const verificarToken = require('../../middleware/verificarToken');  // Importa el middleware
const router = express.Router();

// Esta ruta está protegida por el middleware verificarToken
router.get('/coleccion', verificarToken, async (req, res) => {
  try {
    // Obtener la colección del usuario a partir de su ID
    const coleccion = await Coleccion.find({ usuarioId: req.usuarioId });

    if (!coleccion) {
      return res.status(404).json({ mensaje: 'No se encontró la colección.' });
    }

    res.json(coleccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la colección.' });
  }
});

module.exports = router;
