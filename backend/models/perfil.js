const mongoose = require('mongoose');

const perfilSchema = new mongoose.Schema({
  usuario_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  esAdministrador: {
    type: Boolean,
    default: false, // Por defecto, los usuarios no son administradores
  }
});

// Middleware para validar el email antes de guardar
perfilSchema.pre('save', async function (next) {
  if (!this.isModified('usuario_ID')) return next();

  // Popula el usuario para obtener el email
  await this.populate('usuario_ID');
  if (this.usuario_ID.correo === 'myloterianacional@gmail.com') {
    this.esAdministrador = true;
  }
  next();
});

module.exports = mongoose.model('Perfil', perfilSchema);