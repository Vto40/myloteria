const mongoose = require('mongoose');

const intercambioSchema = new mongoose.Schema({
  usuario_Origen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  usuario_Destino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  decimo_Ofertado: {
    type: String,
    required: true,
  },
  decimo_Solicitado: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    default: 'solicitada',
    enum: ['solicitada', 'aceptada', 'rechazada', 'cancelada'],
  },
  // Campo de fecha de creación
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Intercambio', intercambioSchema);