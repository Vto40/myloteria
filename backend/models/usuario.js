const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  contraseña: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    trim: true,
  },
  esAdministrador: {
    type: Boolean,
    default: false, // Por defecto, los usuarios no son administradores
  },
  baneado: {
    type: Boolean,
    default: false, // Por defecto, los usuarios no están baneados
  },
  fechaRegistro: {
    type: Date,
    default: Date.now, // Fecha de registro automática
  },
  hitosNotificados: {
    type: [Number],
    default: []
  },
});

// Middleware para hashear la contraseña solo si es nueva o modificada
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) return next();
  // Si la contraseña ya está hasheada (longitud 60 y empieza por $2), no la vuelvas a hashear
  if (this.contraseña && this.contraseña.length === 60 && this.contraseña.startsWith('$2')) return next();
  this.contraseña = await bcrypt.hash(this.contraseña, 10);
  next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);
