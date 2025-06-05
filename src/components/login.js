import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Muestra el mensaje del backend si existe
        setMensaje(data.mensaje || 'Error al iniciar sesión.');
        return;
      }

      if (data && data.token) {
        if (data.usuario?.baneado) {
          setMensaje('Tu cuenta ha sido baneada. Ponte en contacto con administración.');
          localStorage.removeItem('token');
          return;
        }
        localStorage.setItem('token', data.token);
        setToken(data.token); // Actualiza el estado global del token
        navigate('/coleccion');
      } else {
        setMensaje('Credenciales incorrectas.');
      }
    } catch (error) {
      setMensaje('Error al iniciar sesión.');
      console.error('Error al iniciar sesión', error);
    }
  };

  const handleForgotPassword = () => {
    navigate('/recuperar-contraseña'); // Redirige a la página de recuperación de contraseña
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        backgroundImage: `url('https://fotografias.lasexta.com/clipping/cmsimages02/2025/05/09/F40E9F13-755C-4A89-A431-232C8146C213/comprobar-resultado-loteria-nacional-hoy-sabado-10-mayo-2025_160.jpg?crop=1266,712,x0,y0&width=544&height=306&optimize=low&format=webply')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      {/* Capa oscura para mejorar contraste */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />
      {/* Contenedor del formulario */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          width: '300px',
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#000' }}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            Iniciar Sesión
          </button>
        </form>
        <button
          type="button"
          onClick={handleForgotPassword}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
            display: 'block',
            textAlign: 'center',
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
        {mensaje && (
          <div style={{ marginTop: '10px', color: 'red', textAlign: 'center' }}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
