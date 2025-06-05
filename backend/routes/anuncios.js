const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/verificarToken');
const Usuario = require('../models/usuario');
const enviarCorreo = require('../utils/mailer');

// Envía un anuncio a todos o a usuarios seleccionados
router.post('/', verificarToken, async (req, res) => {
  try {
    const { mensaje, destinatarios } = req.body;
    if (!mensaje) return res.status(400).json({ mensaje: 'El mensaje es obligatorio.' });

    let usuariosDestino;
    if (Array.isArray(destinatarios) && destinatarios.length > 0) {
      usuariosDestino = await Usuario.find({ _id: { $in: destinatarios } });
    } else {
      usuariosDestino = await Usuario.find();
    }

    // Envía los correos en paralelo para evitar timeout
    await Promise.all(
      usuariosDestino.map(usuario =>
        enviarCorreo(
          usuario.correo,
          'Mensaje del Administrador',
          mensaje
        )
      )
    );

    res.json({ mensaje: 'Anuncio enviado', destinatarios: usuariosDestino.map(u => u.correo) });
  } catch (error) {
    console.error('Error al enviar anuncio:', error);
    res.status(500).json({ mensaje: 'Error al enviar el anuncio.' });
  }
});

module.exports = router;