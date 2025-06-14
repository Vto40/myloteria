const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/verificarToken'); 
const Usuario = require('../models/usuario');
const Log = require('../models/log');
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

    // Registrar log de cambio de perfil
    await Log.create({
      usuario: usuarioActualizado._id,
      tipo: 'cambio_perfil',
      descripcion: 'Actualización de perfil por el usuario'
    });

    res.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

// Endpoint para obtener el perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-contraseña');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    const Numero = require('../models/numero');
    const totalNumeros = await Numero.countDocuments({ propietario: usuario._id });

    res.json({
      ...usuario.toObject(),
      totalNumeros
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil' });
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

// Obtener todos los usuarios (solo para administradores)
router.get('/', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario || !usuario.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuarios = await Usuario.find().select('-contraseña');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener los usuarios.' });
  }
});

// Banear usuario (solo admin)
router.post('/:id/banear', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { baneado: true },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Enviar correo de aviso de baneo
    await enviarCorreo(
      usuario.correo,
      'Tu cuenta ha sido baneada',
      `Hola ${usuario.nombre},\n\nTu cuenta en MyLotería ha sido baneada por el administrador.\nSi crees que esto es un error, ponte en contacto con el equipo de administración.`
    );

    res.json({ mensaje: 'Usuario baneado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al banear usuario' });
  }
});

// Desbanear usuario (solo admin)
router.post('/:id/desbanear', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, { baneado: false }, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario desbaneado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desbanear usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// Hacer administrador (solo admin)
router.post('/:id/hacer-administrador', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, { esAdministrador: true }, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario ahora es administrador' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al convertir en administrador' });
  }
});

// Quitar privilegios de administrador (solo admin)
router.post('/:id/quitar-administrador', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, { esAdministrador: false }, { new: true });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Privilegios de administrador eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al quitar privilegios de administrador' });
  }
});

// Restablecer contraseña (solo admin)
router.post('/:id/restablecer-contraseña', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const nuevaPassword = generarPasswordTemporal();
    const hash = await bcrypt.hash(nuevaPassword, 10);
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { contraseña: hash },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Enviar correo con la nueva contraseña
    await enviarCorreo(
      usuario.correo,
      'Restablecimiento de contraseña',
      `Hola ${usuario.nombre},\n\nTu contraseña ha sido restablecida por un administrador.\nTu nueva contraseña temporal es: ${nuevaPassword}\nPor favor, cámbiala después de iniciar sesión.`
    );

    res.json({ mensaje: 'Contraseña restablecida y enviada por correo', nuevaPassword });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña' });
  }
});

// Obtener información detallada de un usuario (solo admin)
router.get('/:id/detalle', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }

    const usuario = await Usuario.findById(req.params.id).select('-contraseña');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Números del usuario
    const Numero = require('../models/numero');
    const numeros = await Numero.find({ propietario: usuario._id });

    // Intercambios del usuario (como origen o destino)
    const Intercambio = require('../models/intercambio');
    const intercambios = await Intercambio.find({
      $or: [
        { usuario_Origen: usuario._id },
        { usuario_Destino: usuario._id }
      ]
    }).sort({ fecha_oferta: -1 });

    // Últimos 10 logs del usuario
    const Log = require('../models/log');
    const logs = await Log.find({ usuario: usuario._id })
      .sort({ fecha: -1 })
      .limit(10);

    // Valoraciones del usuario
    const Valoracion = require('../models/valoracion');
    const valoraciones = await Valoracion.find({ usuario_valorado: usuario._id });

    res.json({
      usuario,
      numeros,
      intercambios,
      logs,
      valoraciones
    });
  } catch (error) {
    console.error('Error al obtener el detalle del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener el detalle del usuario' });
  }
});

// Eliminar un número de la colección de un usuario
router.delete('/:id/coleccion/:numeroId', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const Numero = require('../models/numero');
    const numero = await Numero.findOneAndDelete({ _id: req.params.numeroId, propietario: req.params.id });
    if (!numero) return res.status(404).json({ mensaje: 'Número no encontrado' });
    res.json({ mensaje: 'Número eliminado de la colección del usuario' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el número' });
  }
});

// Eliminar un intercambio de un usuario
router.delete('/:id/intercambio/:intercambioId', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const Intercambio = require('../models/intercambio');
    const intercambio = await Intercambio.findOneAndDelete({ _id: req.params.intercambioId });
    if (!intercambio) return res.status(404).json({ mensaje: 'Intercambio no encontrado' });
    res.json({ mensaje: 'Intercambio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el intercambio' });
  }
});

// Eliminar una valoración de un usuario
router.delete('/:id/valoracion/:valoracionId', verificarToken, async (req, res) => {
  try {
    const admin = await Usuario.findById(req.usuario.id);
    if (!admin || !admin.esAdministrador) {
      return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    const Valoracion = require('../models/valoracion');
    const valoracion = await Valoracion.findOneAndDelete({ _id: req.params.valoracionId });
    if (!valoracion) return res.status(404).json({ mensaje: 'Valoración no encontrada' });
    res.json({ mensaje: 'Valoración eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la valoración' });
  }
});

module.exports = router;