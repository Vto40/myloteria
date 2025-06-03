import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsuario(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        alert('Error al cargar los datos del perfil.');
      }
    };

    fetchUsuario();
  }, []);

  const handleEditarPerfil = () => {
    navigate('/editar-perfil'); // Redirige a la página de edición del perfil
  };

  if (!usuario) {
    return <p>Cargando datos del perfil...</p>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          width: '400px',
          textAlign: 'center',
        }}
      >
        <img
          src={usuario.foto || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'} // Foto de perfil o imagen por defecto
          alt="Foto de perfil"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            marginBottom: '20px',
          }}
        />
        <h2>{usuario.nombre}</h2>
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Dirección:</strong> {usuario.direccion || 'No especificada'}</p>
        <button
          onClick={handleEditarPerfil}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Editar Perfil
        </button>

        {/* Mostrar enlace al menú de administración si el usuario es administrador */}
        {usuario.esAdministrador && (
          <button
            onClick={() => navigate('/administrador')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#28a745',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Ir al Menú de Administración
          </button>
        )}
      </div>
    </div>
  );
};

export default Perfil;