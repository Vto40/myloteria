const mongoose = require('mongoose');

const valoracionSchema = new mongoose.Schema({
  usuario_valorado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  usuario_valorador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  estrellas: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comentario: {
    type: String,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Valoracion', valoracionSchema);