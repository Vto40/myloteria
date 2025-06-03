const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario'); // Modelo de usuario
const verificarToken = require('../middleware/verificarToken'); // Middleware para verificar el token
const multer = require('multer');
const upload = multer();
const enviarCorreo = require('../utils/mailer');
const bcrypt = require('bcrypt');

function generarPasswordTemporal(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Actualizar datos del usuario
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contraseña, direccion, contraseñaActual } = req.body;

    const updateData = { nombre, correo };
    if (direccion !== undefined) updateData.direccion = direccion;

    // Si se quiere cambiar la contraseña, comprobar la actual
    if (contraseña && contraseña.length >= 6) {
      if (!contraseñaActual) {
        return res.status(400).json({ error: 'Debes indicar la contraseña actual.' });
      }
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const esValida = await bcrypt.compare(contraseñaActual, usuario.contraseña);
      if (!esValida) {
        return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
      }
      const hash = await bcrypt.hash(contraseña, 10);
      updateData.contraseña = hash;
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Devuelve el documento actualizado
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Ruta para obtener los datos del perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id, 'nombre correo direccion foto'); // Selecciona los campos necesarios
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener el perfil del usuario' });
  }
});

// Ruta para recuperar la contraseña
router.post('/recuperar', async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No existe un usuario con ese correo.' });
    }
    const nuevaPassword = generarPasswordTemporal();
    usuario.contraseña = await bcrypt.hash(nuevaPassword, 10);
    await usuario.save();

    await enviarCorreo(
      correo,
      'Recuperación de contraseña',
      `Tu nueva contraseña temporal es: ${nuevaPassword}\nPor favor, cámbiala después de iniciar sesión.`
    );

    res.json({ mensaje: 'Se ha enviado una contraseña temporal a tu correo.' });
  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ mensaje: 'Error al recuperar la contraseña.' });
  }
});

module.exports = router;