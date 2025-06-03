import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Administrador = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [anuncio, setAnuncio] = useState(''); // Estado para el anuncio global

  // Obtener la lista de usuarios desde la API
  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      alert('Error al cargar la lista de usuarios.');
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Eliminar una cuenta
  const handleEliminarCuenta = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar esta cuenta?');
    if (!confirmacion) return;

    try {
      await api.delete(`/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Cuenta eliminada correctamente.');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert('Error al eliminar la cuenta.');
    }
  };

  // Banear una cuenta
  const handleBanearCuenta = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas banear esta cuenta?');
    if (!confirmacion) return;

    try {
      await api.post(`/usuarios/${id}/banear`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Cuenta baneada correctamente.');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error al banear la cuenta:', error);
      alert('Error al banear la cuenta.');
    }
  };

  // Restablecer contraseña
  const handleRestablecerContraseña = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas restablecer la contraseña de esta cuenta?');
    if (!confirmacion) return;

    try {
      await api.post(`/usuarios/${id}/restablecer-contraseña`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Contraseña restablecida correctamente.');
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      alert('Error al restablecer la contraseña.');
    }
  };

  // Agregar una cuenta de administrador
  const handleAgregarAdministrador = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas convertir esta cuenta en administrador?');
    if (!confirmacion) return;

    try {
      await api.post(`/usuarios/${id}/hacer-administrador`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Cuenta convertida en administrador correctamente.');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error al convertir en administrador:', error);
      alert('Error al convertir en administrador.');
    }
  };

  // Enviar anuncio global
  const handleEnviarAnuncio = async (e) => {
    e.preventDefault();
    if (!anuncio.trim()) {
      alert('El anuncio no puede estar vacío.');
      return;
    }

    try {
      await api.post(
        '/anuncios',
        { mensaje: anuncio },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Anuncio enviado correctamente.');
      setAnuncio(''); // Limpia el campo de entrada
    } catch (error) {
      console.error('Error al enviar el anuncio:', error);
      alert('Error al enviar el anuncio.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Panel Administrativo</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

      {/* Formulario para enviar anuncios globales */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
        <h3>Enviar Anuncio Global</h3>
        <form onSubmit={handleEnviarAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            placeholder="Escribe tu anuncio aquí..."
            value={anuncio}
            onChange={(e) => setAnuncio(e.target.value)}
            rows="4"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              resize: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Enviar Anuncio
          </button>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Correo</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Fecha de Registro</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{usuario.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{usuario.correo}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {/* Botones de acciones */}
                <button
                  onClick={() => handleEliminarCuenta(usuario.id)}
                  style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white' }}
                >
                  Eliminar
                </button>
                <button
                  onClick={() => handleBanearCuenta(usuario.id)}
                  style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'orange', color: 'white' }}
                >
                  Banear
                </button>
                <button
                  onClick={() => handleRestablecerContraseña(usuario.id)}
                  style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'blue', color: 'white' }}
                >
                  Restablecer Contraseña
                </button>
                <button
                  onClick={() => handleAgregarAdministrador(usuario.id)}
                  style={{ padding: '5px 10px', backgroundColor: 'green', color: 'white' }}
                >
                  Hacer Administrador
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Administrador;