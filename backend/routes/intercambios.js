const express = require('express');
const Intercambio = require('../models/intercambio');
const Numero = require('../models/numero');
const Usuario = require('../models/usuario');
const verificarToken = require('../middleware/verificarToken');
const enviarCorreo = require('../utils/mailer');
const router = express.Router();

// Crear una nueva oferta de intercambio
router.post('/intercambio', verificarToken, async (req, res) => {
  const { decimo_Ofertado, decimo_Solicitado, usuario_Destino } = req.body;

  try {
    if (!decimo_Ofertado || !decimo_Solicitado || !usuario_Destino) {
      return res.status(400).json({ mensaje: 'Faltan datos para la oferta.' });
    }

    const nuevoIntercambio = new Intercambio({
      decimo_Ofertado,
      decimo_Solicitado,
      usuario_Origen: req.usuario.id,
      usuario_Destino,
      estado: 'solicitada',
    });

    await nuevoIntercambio.save();

    // Notificar por correo a ambos usuarios
    const usuarioOrigen = await Usuario.findById(req.usuario.id);
    const usuarioDestinoObj = await Usuario.findById(usuario_Destino);

    if (usuarioOrigen && usuarioDestinoObj) {
      await enviarCorreo(
        usuarioOrigen.correo,
        'Solicitud de intercambio enviada',
        `Has solicitado un intercambio por el décimo ${decimo_Solicitado}. Ofreces el décimo ${decimo_Ofertado}.`
      );
      await enviarCorreo(
        usuarioDestinoObj.correo,
        'Nueva solicitud de intercambio recibida',
        `Has recibido una solicitud de intercambio por el décimo ${decimo_Solicitado}. Ofrecen el décimo ${decimo_Ofertado}.`
      );
    }

    res.status(201).json({ mensaje: 'Oferta de intercambio creada.', intercambio: nuevoIntercambio });
  } catch (error) {
    console.error('Error al crear la oferta de intercambio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Obtener todas las ofertas de intercambio
router.get('/intercambio', async (req, res) => {
  try {
    const intercambios = await Intercambio.find()
      .populate('usuario_Origen', 'nombre correo') // Incluye datos del usuario origen
      .populate('usuario_Destino', 'nombre correo'); // Incluye datos del usuario destino
    res.json(intercambios);
  } catch (error) {
    console.error('Error al obtener las ofertas de intercambio:', error);
    res.status(500).json({ mensaje: 'Error al obtener las ofertas de intercambio.' });
  }
});

// Obtener todos los números disponibles para intercambio
router.get('/numeros-disponibles', async (req, res) => {
  try {
    const numerosDisponibles = await Numero.find({ intercambio: true }).populate('propietario', 'nombre correo');
    res.json(numerosDisponibles);
  } catch (error) {
    console.error('Error al obtener los números disponibles:', error);
    res.status(500).json({ mensaje: 'Error al obtener los números disponibles.' });
  }
});

// Aceptar una oferta de intercambio
router.put('/intercambio/:id/aceptar', verificarToken, async (req, res) => {
  try {
    const intercambio = await Intercambio.findById(req.params.id);

    if (!intercambio) {
      return res.status(404).json({ mensaje: 'Intercambio no encontrado.' });
    }

    if (intercambio.estado !== 'solicitada') {
      return res.status(400).json({ mensaje: 'El intercambio ya fue gestionado.' });
    }

    intercambio.estado = 'aceptada';
    intercambio.fecha_realizacion = Date.now();

    await intercambio.save();

    // Marcar ambos números como no disponibles para intercambio
    await Numero.updateOne(
      { numero: intercambio.decimo_Ofertado },
      { $set: { intercambio: false } }
    );
    await Numero.updateOne(
      { numero: intercambio.decimo_Solicitado },
      { $set: { intercambio: false } }
    );

    // Notificar por correo a ambos usuarios
    const usuarioOrigen = await Usuario.findById(intercambio.usuario_Origen);
    const usuarioDestino = await Usuario.findById(intercambio.usuario_Destino);

    if (usuarioOrigen && usuarioDestino) {
      await enviarCorreo(
        usuarioOrigen.correo,
        'Intercambio aceptado',
        `El intercambio por el décimo ${intercambio.decimo_Solicitado} ha sido aceptado.\n
Datos de contacto del otro usuario:\n
Nombre: ${usuarioDestino.nombre}\n
Correo: ${usuarioDestino.correo}`
      );
      await enviarCorreo(
        usuarioDestino.correo,
        'Intercambio aceptado',
        `Has aceptado el intercambio por el décimo ${intercambio.decimo_Solicitado}.\n
Datos de contacto del otro usuario:\n
Nombre: ${usuarioOrigen.nombre}\n
Correo: ${usuarioOrigen.correo}`
      );
    }

    res.json({ mensaje: 'Intercambio aceptado.', intercambio });
  } catch (error) {
    console.error('Error al aceptar el intercambio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Rechazar una oferta
router.put('/intercambio/:id/rechazar', verificarToken, async (req, res) => {
  try {
    const intercambio = await Intercambio.findById(req.params.id);
    if (!intercambio) return res.status(404).json({ mensaje: 'Intercambio no encontrado.' });

    intercambio.estado = 'rechazada';
    await intercambio.save();

    // Notificar por correo a ambos usuarios
    const usuarioOrigen = await Usuario.findById(intercambio.usuario_Origen);
    const usuarioDestino = await Usuario.findById(intercambio.usuario_Destino);

    if (usuarioOrigen && usuarioDestino) {
      await enviarCorreo(
        usuarioOrigen.correo,
        'Intercambio rechazado',
        `El intercambio por el décimo ${intercambio.decimo_Solicitado} ha sido rechazado.`
      );
      await enviarCorreo(
        usuarioDestino.correo,
        'Intercambio rechazado',
        `Has rechazado el intercambio por el décimo ${intercambio.decimo_Solicitado}.`
      );
    }

    res.json({ mensaje: 'Intercambio rechazado.', intercambio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Cancelar una oferta
router.put('/intercambio/:id/cancelar', verificarToken, async (req, res) => {
  try {
    const intercambio = await Intercambio.findById(req.params.id);
    if (!intercambio) return res.status(404).json({ mensaje: 'Intercambio no encontrado.' });
    intercambio.estado = 'cancelada';
    await intercambio.save();
    res.json({ mensaje: 'Intercambio cancelado.', intercambio });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Ruta para marcar un número como no disponible para intercambio (cancelar intercambio)
router.put('/coleccion/:id/no-disponible', verificarToken, async (req, res) => {
  try {
    const numero = await Numero.findById(req.params.id);
    if (!numero) {
      return res.status(404).json({ mensaje: 'Número no encontrado.' });
    }
    // Solo el propietario puede cancelar
    if (numero.propietario.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No autorizado para cancelar este intercambio.' });
    }
    numero.intercambio = false;
    await numero.save();
    res.json({ mensaje: 'Intercambio cancelado correctamente.' });
  } catch (error) {
    console.error('Error al cancelar el intercambio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

module.exports = router;