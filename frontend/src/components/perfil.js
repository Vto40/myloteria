import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ value }) => (
  <span>
    {[1,2,3,4,5].map(star => (
      <span
        key={star}
        style={{
          color: star <= value ? '#FFD700' : '#ccc',
          fontSize: 20,
        }}
      >★</span>
    ))}
  </span>
);

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [mediaValoracion, setMediaValoracion] = useState(0);
  const [comentarios, setComentarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsuario(response.data);

        // Obtener media y comentarios de valoraciones
        const mediaRes = await api.get(`/valoraciones/media/${response.data._id}`);
        setMediaValoracion(mediaRes.data.media || 0);

        const comentariosRes = await api.get(`/valoraciones/comentarios/${response.data._id}`);
        setComentarios(comentariosRes.data || []);
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

  // Total de números posibles en la colección
  const TOTAL_NUMEROS = 100000;

  // Usa el total real de la colección
  const totalUsuario = usuario.totalNumeros || 0;

  const logros = [];
  const pendientes = [];

  // Logro 100 números
  if (usuario.hitosNotificados.includes(100)) {
    logros.push('Has alcanzado 100 números en tu colección.');
  } else {
    pendientes.push({ texto: 'Alcanza 100 números en tu colección.', faltan: 100 - totalUsuario });
  }

  // Logro 1000 números
  if (usuario.hitosNotificados.includes(1000)) {
    logros.push('Has alcanzado 1000 números en tu colección.');
  } else if (totalUsuario >= 100) {
    pendientes.push({ texto: 'Alcanza 1000 números en tu colección.', faltan: 1000 - totalUsuario });
  }

  // Logros de porcentaje: solo 10%, 20%, 30%, 40%, 50%, 100%
  const porcentajes = [10, 20, 30, 40, 50, 100];
  for (let pct of porcentajes) {
    const meta = Math.ceil((pct / 100) * TOTAL_NUMEROS);
    if (usuario.hitosNotificados.includes(pct) && totalUsuario >= meta) {
      logros.push(`Has completado el ${pct}% de tu colección.`);
    } else if (totalUsuario < meta) {
      pendientes.push({ texto: `Completa el ${pct}% de tu colección (${meta} números).`, faltan: meta - totalUsuario });
    }
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
          width: '60%',
          textAlign: 'center',
        }}
      >
        <img
          src={usuario.foto || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png'}
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
        {/* Comentario para comprobar si es administrador */}
        {usuario.esAdministrador && (
          <p style={{ color: 'green', fontWeight: 'bold', marginTop: 10 }}>
            Este usuario es administrador (info recibida correctamente)
          </p>
        )}
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
      </div>

      {/* Sección de administración solo para administradores */}
      {usuario.esAdministrador && (
        <div
          style={{
            marginTop: 30,
            backgroundColor: '#fffbe6',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(255, 193, 7, 0.15)',
            width: '60%',
            textAlign: 'center',
            border: '1.5px solid #ffe082',
          }}
        >
          <h3 style={{ color: '#bfa100', marginBottom: 12 }}>Zona de Administración</h3>
          <p style={{ color: '#bfa100', marginBottom: 18 }}>
            Accede a las herramientas de administración de la web.
          </p>
          <button
            onClick={() => navigate('/administrador')}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#ffc107',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Ir al Menú de Administración
          </button>
        </div>
      )}

      {/* Valoraciones debajo y aparte del cuadro de perfil */}
      <div
        style={{
          marginTop: 30,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
          width: '60%',
          textAlign: 'left',
        }}
      >
        <h3 style={{ marginBottom: 8, fontSize: 18, textAlign: 'center' }}>Valoraciones</h3>
        <div style={{ textAlign: 'center' }}>
          <StarRating value={Math.round(mediaValoracion)} />
          <span style={{ marginLeft: 8, color: '#888', fontSize: 15 }}>
            ({mediaValoracion ? mediaValoracion.toFixed(2) : '0.00'})
          </span>
        </div>
        <div style={{ marginTop: 10 }}>
          {comentarios.length === 0 ? (
            <span style={{ color: '#888', fontSize: 14 }}>Sin comentarios aún.</span>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {comentarios.map(c => (
                <li key={c._id} style={{ marginBottom: 8 }}>
                  <b>{c.usuario_valorador?.nombre || 'Usuario'}:</b> {c.estrellas}★<br />
                  {c.comentario}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Logros del usuario */}
      <div
        style={{
          marginTop: 30,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
          width: '60%',
          textAlign: 'left',
        }}
      >
        <h3 style={{ marginBottom: 8, fontSize: 18, textAlign: 'center' }}>Logros de Colección</h3>
        <div style={{ marginBottom: 12, color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
          Tienes {totalUsuario} números en tu colección de {TOTAL_NUMEROS}
        </div>
        {logros.length === 0 ? (
          <span style={{ color: '#888', fontSize: 14 }}>Aún no has alcanzado ningún logro de colección.</span>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {logros.map((logro, idx) => (
              <li key={idx} style={{ marginBottom: 8, color: '#388e3c' }}>
                {logro}
              </li>
            ))}
          </ul>
        )}
        {pendientes.length > 0 && (
          <>
            <h4 style={{ marginTop: 18, fontSize: 15, color: '#1976d2' }}>Próximos logros:</h4>
            <ul style={{ paddingLeft: 18 }}>
              {pendientes.map((pend, idx) => (
                <li key={idx} style={{ marginBottom: 8, color: '#888' }}>
                  {pend.texto} <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>(Te faltan {pend.faltan})</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Perfil;