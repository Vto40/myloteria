const mongoose = require('mongoose');

const intercambioSchema = new mongoose.Schema({
  decimo_Ofertado: {
    type: String,
    required: true,
  },
  decimo_Solicitado: {
    type: String,
    required: true,
  },
  usuario_Origen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  usuario_Destino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false,
  },
  fecha_oferta: {
    type: Date,
    default: Date.now,
  },
  fecha_realizacion: {
    type: Date,
    required: false,
  },
  estado: {
    type: String,
    default: 'solicitada',
    enum: ['solicitada', 'aceptada', 'rechazada', 'cancelada'],
  },
});

module.exports = mongoose.model('Intercambio', intercambioSchema);