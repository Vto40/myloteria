require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const coleccionRoutes = require('./routes/coleccion'); // Importa las rutas de colección
const authRoutes = require('./routes/auth'); // Importa las rutas de autenticación
const usuariosRoutes = require('./routes/usuarios'); // Importa las rutas de usuarios
const intercambiosRoutes = require('./routes/intercambios'); // Importa las rutas de intercambio
const valoracionesRouter = require('./routes/valoraciones'); // Importa las rutas de valoraciones
const anunciosRoutes = require('./routes/anuncios'); // Importa las rutas de anuncios

const app = express();

// Middleware
app.use(express.json()); // Para manejar el cuerpo de las solicitudes como JSON
app.use(cors()); // Para habilitar CORS

// Rutas de autenticación
app.use('/api/auth', authRoutes); // Registra las rutas de autenticación

// Rutas protegidas
app.use('/api/coleccion', coleccionRoutes); // Ruta para acceder a la colección

// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes); // Registra las rutas de usuarios

// Rutas de intercambio
app.use('/api', intercambiosRoutes); // Usa las rutas de intercambio

// Rutas de valoraciones
app.use('/api/valoraciones', valoracionesRouter); // Registra las rutas de valoraciones

// Rutas de anuncios
app.use('/api/anuncios', anunciosRoutes); // Registra las rutas de anuncios

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI);
// , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Conectado a MongoDB'))
//   .catch((err) => console.error('Error al conectar con MongoDB:', err));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
