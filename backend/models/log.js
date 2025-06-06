const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, required: true }, // Ejemplo: 'valoracion', 'login', etc.
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);