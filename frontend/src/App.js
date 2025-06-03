import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import RegisterForm from './components/register';
import Collection from './components/collection';
import Home from './components/home';
import Perfil from './components/perfil';
import Intercambio from './components/intercambio';
import EditPerfil from './components/editperfil';
import RecuperarContraseña from './components/recuperarContraseña';
import Nav from './components/nav';
import Administrador from './components/administrador';
import MisOfertasIntercambio from './components/MisOfertasIntercambio'; // Asegúrate de importar

function App() {
  // Inicializa el token desde localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Nav token={token} setToken={setToken} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/registro" element={<RegisterForm />} />
        <Route path="/coleccion" element={<Collection />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/intercambio" element={<Intercambio />} />
        <Route path="/editar-perfil" element={<EditPerfil />} />
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
        <Route path="/administrador" element={<Administrador />} />
        <Route path="/mis-ofertas-intercambio" element={<MisOfertasIntercambio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;