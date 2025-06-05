import React, { useState } from 'react';
import api from '../services/api';

const RecuperarContraseña = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      await api.post('/usuarios/recuperar', { correo });
      setMensaje('Se ha enviado una contraseña temporal a tu correo.');
    } catch (error) {
      setMensaje(
        error.response?.data?.mensaje || 'Error al enviar el correo de recuperación.'
      );
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
        <h2 style={{ textAlign: 'center' }}>Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            Enviar
          </button>
        </form>
        {mensaje && (
          <div style={{ marginTop: 10, color: mensaje.startsWith('Se ha enviado') ? 'green' : 'red' }}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecuperarContraseña;