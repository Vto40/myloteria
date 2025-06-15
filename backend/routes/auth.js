const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const Log = require('../models/log');

const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
  const { nombre, correo, contraseña, direccion } = req.body;

  try {
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Crear un nuevo usuario
    const nuevoUsuario = new Usuario({ nombre, correo, contraseña, direccion });

    // Guardar el usuario en la base de datos (el middleware encripta la contraseña)
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // Nueva verificación, si el usuario está baneado o no
    if (usuario.baneado) {
      return res.status(403).json({ mensaje: 'Tu cuenta ha sido baneada. Ponte en contacto con administración.' });
    }

    const esValido = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValido) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // Si pasa el login:
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Registrar log de inicio de sesión
    await Log.create({
      usuario: usuario._id,
      tipo: 'login',
      descripcion: 'Inicio de sesión exitoso'
    });

    res.json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        esAdministrador: usuario.esAdministrador,
        baneado: usuario.baneado
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
