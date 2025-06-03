// backend/routes/coleccion.js
const express = require('express');
const verificarToken = require('../middleware/verificarToken');
const Numero = require('../models/numero'); // Importa el modelo Numero
const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  try {
    // Obtén todos los números de la base de datos
    const coleccion = await Numero.find({ propietario: req.usuario.id });
    res.json(coleccion); // Devuelve el objeto completo, incluyendo _id y numero
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la colección' });
  }
});

router.post('/', verificarToken, async (req, res) => {
  try {
    const { numero: numerostr } = req.body;
    const numero = parseInt(numerostr, 10); // Convierte el número a entero
    // Validar el número
    if (isNaN(numero) || numero < 0 || numero > 99999) {
      return res.status(400).json({ mensaje: 'Número inválido. Debe estar entre 00000 y 99999.' });
    }

    // Verificar si el número ya existe para el usuario
    const existe = await Numero.findOne({ numero: numerostr, propietario: req.usuario.id });
    if (existe) {
      return res.status(400).json({ mensaje: 'El número ya está en la colección.' });
    }

    // Crear un nuevo número y guardarlo en la base de datos
    const nuevoNumero = new Numero({
      numero: numerostr,
      intercambio: false, // Inicialmente no está disponible para intercambio
      propietario: req.usuario.id, // Asocia el número al usuario autenticado
    });

    await nuevoNumero.save();

    res.status(201).json({ mensaje: 'Número añadido con éxito', numero: nuevoNumero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al añadir el número a la colección' });
  }
});

// Ruta para marcar un número como disponible para intercambio
router.put('/:id/disponible', verificarToken, async (req, res) => {
  try {
    const numeroId = req.params.id;

    // Buscar el número por ID y verificar que pertenece al usuario autenticado
    const numero = await Numero.findOne({ _id: numeroId, propietario: req.usuario.id });
    if (!numero) {
      return res.status(404).json({ mensaje: 'Número no encontrado o no pertenece al usuario.' });
    }

    // Actualizar el estado de intercambio a true
    numero.intercambio = true;
    await numero.save();

    res.json({ mensaje: 'Número marcado como disponible para intercambio.', numero });
  } catch (error) {
    console.error('Error al marcar el número como disponible:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Ruta para eliminar un número de la colección
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const numeroId = req.params.id;
    const eliminado = await Numero.findOneAndDelete({ _id: numeroId, propietario: req.usuario.id });
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Número no encontrado o no pertenece al usuario.' });
    }
    res.json({ mensaje: 'Número eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el número:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

module.exports = router;
