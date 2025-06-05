import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Administrador = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [anuncio, setAnuncio] = useState('');
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const navigate = useNavigate();

  // Login de administrador
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const res = await api.post('/login', { correo, contraseña });
      // El backend debe devolver el token y esAdministrador
      if (res.data && res.data.token && res.data.usuario?.esAdministrador) {
        localStorage.setItem('token', res.data.token);
        setIsAdmin(true);
        setAdminChecked(true);
        setCorreo('');
        setContraseña('');
      } else {
        setMensaje('No tienes permisos de administrador.');
        setIsAdmin(false);
        setAdminChecked(true);
        localStorage.removeItem('token');
        navigate('/');
      }
    } catch (error) {
      setMensaje('Credenciales incorrectas o error de conexión.');
      setIsAdmin(false);
      setAdminChecked(true);
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  // Obtener la lista de usuarios desde la API solo si es admin
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
    // Si ya hay token, verifica si es admin
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAdminChecked(true);
        setIsAdmin(false);
        localStorage.removeItem('token');
        navigate('/');
        return;
      }
      try {
        const res = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.esAdministrador) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          localStorage.removeItem('token');
          navigate('/');
        }
        setAdminChecked(true);
      } catch {
        setIsAdmin(false);
        setAdminChecked(true);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    checkAdmin();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isAdmin) fetchUsuarios();
  }, [isAdmin]);

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

  // Desbanear una cuenta
  const handleDesbanearCuenta = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas quitar el baneo de esta cuenta?');
    if (!confirmacion) return;

    try {
      await api.post(`/usuarios/${id}/desbanear`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Cuenta desbaneada correctamente.');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error al desbanear la cuenta:', error);
      alert('Error al desbanear la cuenta.');
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

  // Quitar privilegios de administrador
  const handleQuitarAdministrador = async (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas quitar los privilegios de administrador a esta cuenta?');
    if (!confirmacion) return;

    try {
      await api.post(`/usuarios/${id}/quitar-administrador`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMensaje('Privilegios de administrador eliminados correctamente.');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error al quitar privilegios de administrador:', error);
      alert('Error al quitar privilegios de administrador.');
    }
  };

  // Selección de usuarios
  const handleSeleccionUsuario = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSeleccionarTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados([]);
      setTodosSeleccionados(false);
    } else {
      setSeleccionados(usuarios.map((u) => u._id || u.id));
      setTodosSeleccionados(true);
    }
  };

  useEffect(() => {
    setTodosSeleccionados(
      seleccionados.length > 0 && seleccionados.length === usuarios.length
    );
  }, [seleccionados, usuarios]);

  // Enviar anuncio global o a seleccionados
  const handleEnviarAnuncio = async (e) => {
    e.preventDefault();
    if (!anuncio.trim()) {
      alert('El anuncio no puede estar vacío.');
      return;
    }
    try {
      await api.post(
        '/anuncios',
        {
          mensaje: anuncio,
          destinatarios: seleccionados.length > 0 ? seleccionados : undefined,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert(
        seleccionados.length > 0
          ? 'Mensaje enviado a los usuarios seleccionados.'
          : 'Anuncio enviado a todos los usuarios.'
      );
      setAnuncio('');
    } catch (error) {
      console.error('Error al enviar el anuncio:', error);
      alert('Error al enviar el anuncio.');
    }
  };

  // Ver detalle de usuario
  const handleVerDetalleUsuario = async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}/detalle`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsuarioDetalle(response.data);
      setDetalleVisible(true);
    } catch (error) {
      alert('Error al cargar el detalle del usuario.');
    }
  };

  // Si no está autenticado como admin, muestra el login
  if (!adminChecked || !isAdmin) {
    return (
      <div style={{ padding: '40px', maxWidth: 400, margin: '40px auto', background: 'white', borderRadius: 8, boxShadow: '0 2px 8px #ccc' }}>
        <h2>Acceso Administrador</h2>
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="Correo de administrador"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={e => setContraseña(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#1976d2',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Entrar
          </button>
        </form>
        {mensaje && <p style={{ color: 'red', marginTop: 16 }}>{mensaje}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Panel Administrativo</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

      {/* Formulario para enviar anuncios */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
        <h3>Enviar Mensaje</h3>
        <form onSubmit={handleEnviarAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            placeholder="Escribe tu mensaje aquí..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleSeleccionarTodos}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #888',
                backgroundColor: todosSeleccionados ? '#1976d2' : '#eee',
                color: todosSeleccionados ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {todosSeleccionados ? 'Desmarcar Todos' : 'Marcar Todos'}
            </button>
            <span style={{ fontSize: 13, color: '#888' }}>
              {seleccionados.length === 0
                ? 'Se enviará a todos'
                : `Seleccionados: ${seleccionados.length}`}
            </span>
          </div>
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
            Enviar Mensaje
          </button>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={handleSeleccionarTodos}
              />
            </th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Correo</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Fecha de Registro</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Administrador</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Baneado</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id || usuario._id}>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={seleccionados.includes(usuario._id || usuario.id)}
                  onChange={() => handleSeleccionUsuario(usuario._id || usuario.id)}
                />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{usuario.nombre}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{usuario.correo}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                {usuario.esAdministrador ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Sí</span>
                ) : (
                  <span style={{ color: 'gray' }}>No</span>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                {usuario.baneado ? (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>Baneado</span>
                ) : (
                  <span style={{ color: 'green' }}>Activo</span>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                {/* Botón de Detalles */}
                <button
                  onClick={() => handleVerDetalleUsuario(usuario._id || usuario.id)}
                  style={{
                    marginRight: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Detalles
                </button>
                <button
                  onClick={() => handleEliminarCuenta(usuario.id || usuario._id)}
                  style={{
                    marginRight: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#e53935', // rojo
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
                {usuario.baneado ? (
                  <button
                    onClick={() => handleDesbanearCuenta(usuario.id || usuario._id)}
                    style={{
                      marginRight: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#43a047', // verde
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Quitar Baneo
                  </button>
                ) : (
                  <button
                    onClick={() => handleBanearCuenta(usuario.id || usuario._id)}
                    style={{
                      marginRight: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#fb8c00', // naranja
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Banear
                  </button>
                )}
                <button
                  onClick={() => handleRestablecerContraseña(usuario.id || usuario._id)}
                  style={{
                    marginRight: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#8e24aa', // morado
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Restablecer Contraseña
                </button>
                <button
                  onClick={() =>
                    usuario.esAdministrador
                      ? handleQuitarAdministrador(usuario.id || usuario._id)
                      : handleAgregarAdministrador(usuario.id || usuario._id)
                  }
                  style={{
                    padding: '5px 10px',
                    backgroundColor: usuario.esAdministrador ? '#757575' : '#388e3c', // gris o verde
                    color: 'white',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '5px',
                  }}
                >
                  {usuario.esAdministrador ? 'Quitar Administrador' : 'Hacer Administrador'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detalle de usuario */}
      {detalleVisible && usuarioDetalle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <DetalleUsuarioAcordeon usuarioDetalle={usuarioDetalle} onClose={() => setDetalleVisible(false)} />
        </div>
      )}
    </div>
  );
};

// Acordeón simple para detalles de usuario
const DetalleUsuarioAcordeon = ({ usuarioDetalle, onClose }) => {
  const [open, setOpen] = useState({
    numeros: false,
    intercambios: false,
    logs: false,
    valoraciones: false, // añade valoraciones
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Eliminar número de la colección
  const handleEliminarNumero = async (numeroId) => {
    if (!window.confirm('¿Eliminar este número de la colección del usuario?')) return;
    try {
      await api.delete(`/usuarios/${usuarioDetalle.usuario._id}/coleccion/${numeroId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Número eliminado.');
      onClose(); // O recarga el detalle si prefieres
    } catch {
      alert('Error al eliminar el número.');
    }
  };

  // Eliminar intercambio
  const handleEliminarIntercambio = async (intercambioId) => {
    if (!window.confirm('¿Eliminar este intercambio?')) return;
    try {
      await api.delete(`/usuarios/${usuarioDetalle.usuario._id}/intercambio/${intercambioId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Intercambio eliminado.');
      onClose();
    } catch {
      alert('Error al eliminar el intercambio.');
    }
  };

  // Eliminar valoración
  const handleEliminarValoracion = async (valoracionId) => {
    if (!window.confirm('¿Eliminar esta valoración?')) return;
    try {
      await api.delete(`/usuarios/${usuarioDetalle.usuario._id}/valoracion/${valoracionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Valoración eliminada.');
      onClose();
    } catch {
      alert('Error al eliminar la valoración.');
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: 40,
      borderRadius: 12,
      width: '90vw',
      height: '90vh',
      maxWidth: 'none',
      maxHeight: 'none',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      position: 'relative'
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'transparent',
          border: 'none',
          fontSize: 32,
          cursor: 'pointer',
          color: '#888'
        }}
        aria-label="Cerrar"
      >×</button>
      <h2 style={{ marginBottom: 20 }}>Detalle de usuario</h2>
      <p><b>Nombre:</b> {usuarioDetalle.usuario.nombre}</p>
      <p><b>Correo:</b> {usuarioDetalle.usuario.correo}</p>
      <p><b>Dirección:</b> {usuarioDetalle.usuario.direccion || 'No especificada'}</p>
      <p><b>Administrador:</b> {usuarioDetalle.usuario.esAdministrador ? 'Sí' : 'No'}</p>
      <p><b>Baneado:</b> {usuarioDetalle.usuario.baneado ? 'Sí' : 'No'}</p>
      <p><b>Fecha de registro:</b> {new Date(usuarioDetalle.usuario.fechaRegistro).toLocaleString()}</p>
      <hr />

      {/* Acordeón Números */}
      <div>
        <button
          onClick={() => toggle('numeros')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px', background: '#f1f1f1',
            border: 'none', borderRadius: 4, marginBottom: 4, fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {open.numeros ? '▼' : '►'} Números en su colección ({usuarioDetalle.numeros.length})
        </button>
        {open.numeros && (
          <div style={{ marginLeft: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                {(() => {
                  // Mostrar 8 números por fila
                  const cols = 8;
                  const filas = [];
                  for (let i = 0; i < usuarioDetalle.numeros.length; i += cols) {
                    filas.push(usuarioDetalle.numeros.slice(i, i + cols));
                  }
                  return filas.map((fila, idx) => (
                    <tr key={idx}>
                      {fila.map(num => (
                        <td
                          key={num._id}
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: 18,
                            background: '#f9f9f9',
                            position: 'relative'
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {num.numero}
                            <button
                              onClick={() => handleEliminarNumero(num._id)}
                              style={{
                                marginLeft: 6,
                                padding: '2px 6px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: 4,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 12,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 24
                              }}
                              aria-label="Eliminar número"
                            >
                              ×
                            </button>
                          </span>
                        </td>
                      ))}
                      {/* Si la última fila tiene menos de cols, rellena celdas vacías */}
                      {fila.length < cols &&
                        Array.from({ length: cols - fila.length }).map((_, i) => (
                          <td key={`empty-${i}`} style={{ border: '1px solid #ccc', padding: '8px', background: '#f9f9f9' }} />
                        ))}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acordeón Intercambios */}
      <div>
        <button
          onClick={() => toggle('intercambios')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px', background: '#f1f1f1',
            border: 'none', borderRadius: 4, marginBottom: 4, fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {open.intercambios ? '▼' : '►'} Intercambios ({usuarioDetalle.intercambios.length})
        </button>
        {open.intercambios && (
          <ul style={{ marginLeft: 20 }}>
            {usuarioDetalle.intercambios.map(i => (
              <li key={i._id}>
                {i.decimo_Ofertado} ⇄ {i.decimo_Solicitado} ({i.estado}) - {new Date(i.createdAt).toLocaleString()}
                <button
                  onClick={() => handleEliminarIntercambio(i._id)}
                  style={{
                    marginLeft: 10,
                    padding: '2px 6px',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                  aria-label="Eliminar intercambio"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acordeón Logs */}
      <div>
        <button
          onClick={() => toggle('logs')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px', background: '#f1f1f1',
            border: 'none', borderRadius: 4, marginBottom: 4, fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {open.logs ? '▼' : '►'} Últimos 10 logs ({usuarioDetalle.logs.length})
        </button>
        {open.logs && (
          <ul style={{ marginLeft: 20 }}>
            {usuarioDetalle.logs.map(log => (
              <li key={log._id}>
                [{new Date(log.fecha).toLocaleString()}] {log.tipo} - {log.descripcion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Acordeón Valoraciones */}
      <div>
        <button
          onClick={() => toggle('valoraciones')}
          style={{
            width: '100%', textAlign: 'left', padding: '8px', background: '#f1f1f1',
            border: 'none', borderRadius: 4, marginBottom: 4, fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {open.valoraciones ? '▼' : '►'} Valoraciones ({usuarioDetalle.valoraciones?.length || 0})
        </button>
        {open.valoraciones && (
          <ul style={{ marginLeft: 20 }}>
            {usuarioDetalle.valoraciones && usuarioDetalle.valoraciones.length > 0 ? (
              usuarioDetalle.valoraciones.map(v => (
                <li key={v._id}>
                  <b>{v.estrellas}★</b> {v.comentario}
                  <button
                    onClick={() => handleEliminarValoracion(v._id)}
                    style={{
                      marginLeft: 10,
                      padding: '2px 6px',
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    aria-label="Eliminar valoración"
                  >
                    Eliminar
                  </button>
                </li>
              ))
            ) : (
              <li style={{ color: '#888' }}>Sin valoraciones</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Administrador;