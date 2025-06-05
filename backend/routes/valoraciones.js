const express = require('express');
const router = express.Router();
const Valoracion = require('../models/valoracion');
const verificarToken = require('../middleware/verificarToken');

// Ruta de prueba para comprobar que funciona
router.get('/ping', (req, res) => {
  res.json({ ok: true, mensaje: 'Valoraciones funcionando' });
});

// Crear una valoración
router.post('/', verificarToken, async (req, res) => {
  try {
    const { usuario_valorado, estrellas, comentario } = req.body;
    const nueva = new Valoracion({
      usuario_valorado,
      usuario_valorador: req.usuario.id,
      estrellas,
      comentario
    });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar la valoración.' });
  }
});

// Obtener media y cantidad de valoraciones de un usuario
router.get('/media/:usuarioId', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const valoraciones = await Valoracion.find({ usuario_valorado: usuarioId });
    const total = valoraciones.length;
    const media = total > 0 ? (valoraciones.reduce((acc, v) => acc + v.estrellas, 0) / total) : 0;
    res.json({ media, total });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la media.' });
  }
});

// Obtener comentarios de un usuario
router.get('/comentarios/:usuarioId', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const comentarios = await Valoracion.find({ usuario_valorado: usuarioId, comentario: { $ne: '' } })
      .populate('usuario_valorador', 'nombre');
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los comentarios.' });
  }
});

module.exports = router;
