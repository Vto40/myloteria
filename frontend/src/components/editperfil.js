import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const EditPerfil = () => {
  const [usuarioId, setUsuarioId] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [contraseñaActual, setContraseñaActual] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [repetirContraseña, setRepetirContraseña] = useState('');
  const [mensajePass, setMensajePass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const { _id, nombre, correo, direccion } = response.data;
        setUsuarioId(_id);
        setNombre(nombre);
        setCorreo(correo);
        setDireccion(direccion || '');
      } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
        alert('Error al cargar los datos del perfil.');
      }
    };

    fetchUsuario();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('correo', correo);
      formData.append('direccion', direccion);

      await api.put(`/usuarios/${usuarioId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Perfil actualizado con éxito.');
      navigate('/perfil');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMensajePass('');
    if (!contraseñaActual || !nuevaContraseña || !repetirContraseña) {
      setMensajePass('Rellena todos los campos.');
      return;
    }
    if (nuevaContraseña !== repetirContraseña) {
      setMensajePass('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (nuevaContraseña.length < 6) {
      setMensajePass('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      await api.put(
        `/usuarios/${usuarioId}`,
        {
          contraseñaActual,
          contraseña: nuevaContraseña,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMensajePass('Contraseña cambiada con éxito.');
      setContraseñaActual('');
      setNuevaContraseña('');
      setRepetirContraseña('');
      setTimeout(() => setMostrarCambioPass(false), 1500);
    } catch (error) {
      setMensajePass(
        error.response?.data?.mensaje || 'Error al cambiar la contraseña.'
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          width: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Editar Perfil</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
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
            Guardar Cambios
          </button>
        </form>
        <button
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#28a745',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => setMostrarCambioPass(!mostrarCambioPass)}
        >
          Cambiar contraseña
        </button>
        {mostrarCambioPass && (
          <form
            onSubmit={handleChangePassword}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '15px',
            }}
          >
            <input
              type="password"
              placeholder="Contraseña actual"
              value={contraseñaActual}
              onChange={(e) => setContraseñaActual(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaContraseña}
              onChange={(e) => setNuevaContraseña(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />
            <input
              type="password"
              placeholder="Repetir nueva contraseña"
              value={repetirContraseña}
              onChange={(e) => setRepetirContraseña(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
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
              Guardar nueva contraseña
            </button>
            {mensajePass && (
              <div
                style={{
                  color: mensajePass.includes('éxito') ? 'green' : 'red',
                  marginTop: 5,
                }}
              >
                {mensajePass}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPerfil;