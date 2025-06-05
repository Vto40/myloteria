const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, required: true }, // Ej: 'login', 'cambio_perfil'
  descripcion: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);