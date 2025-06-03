import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function RegisterForm({ setToken }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [direccion, setDireccion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post('/auth/registro', { nombre, correo, contraseña, direccion });
      alert('Usuario registrado correctamente');
    } catch (error) {
      console.error('Error al registrar:', error);
      alert(error.response?.data?.mensaje || 'Error al registrar');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          width: '300px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Registro</h2>
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
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
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
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
