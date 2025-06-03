const mongoose = require('mongoose');

const numeroSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    // Asegura que no se repita el número para el mismo propietario
    unique: false // No global, pero lo controlamos por propietario
  },
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  intercambio: {
    type: Boolean,
    default: false
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para evitar duplicados por usuario
numeroSchema.index({ numero: 1, propietario: 1 }, { unique: true });

// Middleware para asegurar que no sea deseado e intercambio al mismo tiempo
numeroSchema.pre('save', function (next) {
  if (this.deseado && this.intercambio) {
    return next(new Error('Un número no puede ser deseado y de intercambio al mismo tiempo.'));
  }
  next();
});

module.exports = mongoose.model('Numero', numeroSchema);
