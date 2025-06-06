const express = require('express');
const router = express.Router();
const Valoracion = require('../models/valoracion');
const Log = require('../models/log'); // Importa el modelo de logs
const Intercambio = require('../models/intercambio'); // Asegúrate de importar el modelo de Intercambio
const verificarToken = require('../middleware/verificarToken');

// Ruta de prueba para comprobar que funciona
router.get('/ping', (req, res) => {
  res.json({ ok: true, mensaje: 'Valoraciones funcionando' });
});

// Crear una valoración
router.post('/', verificarToken, async (req, res) => {
  try {
    const { usuario_valorado, intercambio } = req.body;

    // Verificar si el usuario ya valoró este intercambio
    const valoracionExistente = await Valoracion.findOne({
      usuario_valorador: req.usuario.id,
      intercambio,
    });

    if (valoracionExistente) {
      return res.status(400).json({ mensaje: 'Ya has valorado este intercambio.' });
    }

    // Verificar si el usuario está autorizado para valorar (origen o destino del intercambio)
    const intercambioObj = await Intercambio.findById(intercambio);
    if (!intercambioObj) {
      return res.status(404).json({ mensaje: 'Intercambio no encontrado.' });
    }

    if (
      intercambioObj.usuario_Origen.toString() !== req.usuario.id &&
      intercambioObj.usuario_Destino.toString() !== req.usuario.id
    ) {
      return res.status(403).json({ mensaje: 'No estás autorizado para valorar este intercambio.' });
    }

    // Crear nueva valoración
    const nueva = new Valoracion({
      usuario_valorado,
      usuario_valorador: req.usuario.id,
      estrellas: req.body.estrellas,
      comentario: req.body.comentario,
      intercambio,
    });
    await nueva.save();

    // Registrar log de la valoración
    await Log.create({
      usuario: req.usuario.id,
      tipo: 'valoracion',
      descripcion: `Valoración realizada para el intercambio ${intercambio} con ${req.body.estrellas} estrellas.`,
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al guardar la valoración:', error);
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

// Obtener todas mis valoraciones
router.get('/mis-valoraciones', verificarToken, async (req, res) => {
  try {
    const valoraciones = await Valoracion.find({ usuario_valorador: req.usuario.id });
    res.json(valoraciones);
  } catch (error) {
    console.error('Error al obtener las valoraciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener las valoraciones.' });
  }
});

module.exports = router;
