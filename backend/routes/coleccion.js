// backend/routes/coleccion.js
const express = require('express');
const verificarToken = require('../middleware/verificarToken');
const Numero = require('../models/numero'); // Importa el modelo Numero
const Usuario = require('../models/usuario');
const enviarCorreo = require('../utils/mailer');
const router = express.Router();

// Cambia este valor por el total real de números posibles en la colección, nuestro caso 100.000
const TOTAL_NUMEROS = 100000;

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
      intercambio: false,
      propietario: req.usuario.id,
    });

    await nuevoNumero.save();

    // Obtener usuario y progreso
    const usuario = await Usuario.findById(req.usuario.id);
    const totalNumeros = await Numero.countDocuments({ propietario: req.usuario.id });
    const porcentaje = Math.floor((totalNumeros / TOTAL_NUMEROS) * 100);

    let hitoAlcanzado = null;
    let hitoClave = null;

    // Hito especial: 100 números
    if (totalNumeros === 100 && !usuario.hitosNotificados.includes(100)) {
      hitoAlcanzado = `¡Felicidades ${usuario.nombre}! Has alcanzado 100 números en tu colección de Lotería.`;
      hitoClave = 100;
    }

    // Hito especial: 1000 números
    else if (totalNumeros === 1000 && !usuario.hitosNotificados.includes(1000)) {
      hitoAlcanzado = `¡Felicidades ${usuario.nombre}! Has alcanzado 1000 números en tu colección de Lotería.`;
      hitoClave = 1000;
    }

    // Hitos de porcentaje múltiplo de 10% (10%, 20%, ..., 100%)
    else if (porcentaje > 0 && porcentaje % 10 === 0 && !usuario.hitosNotificados.includes(porcentaje)) {
      hitoAlcanzado = `¡Felicidades ${usuario.nombre}! Has completado el ${porcentaje}% de tu colección de números en Lotería.`;
      hitoClave = porcentaje;
    }

    // Envía el correo y agrega al log si corresponde y marca el hito como notificado
    if (hitoAlcanzado && hitoClave !== null) {
      await enviarCorreo(
        usuario.correo,
        '¡Nuevo logro en tu colección!',
        hitoAlcanzado
      );
      usuario.hitosNotificados.push(hitoClave);
      await usuario.save();

      // Registrar en el log
      const Log = require('../models/log');
      await Log.create({
        usuario: usuario._id,
        tipo: 'logro_coleccion',
        descripcion: `Logro alcanzado: ${hitoAlcanzado}`
      });
    }

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
