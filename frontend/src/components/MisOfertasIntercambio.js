import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StarRating = ({ value, onChange, readOnly = false }) => (
  <span>
    {[1,2,3,4,5].map(star => (
      <span
        key={star}
        style={{
          color: star <= value ? '#FFD700' : '#ccc',
          cursor: readOnly ? 'default' : 'pointer',
          fontSize: 18,
        }}
        onClick={e => {
          if (!readOnly && onChange) onChange(star);
          e.stopPropagation();
        }}
        role="button"
        aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
      >★</span>
    ))}
  </span>
);

const MisOfertasIntercambio = () => {
  const [ofertas, setOfertas] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [busquedaNumero, setBusquedaNumero] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [orden, setOrden] = useState('reciente'); // Nuevo estado para el orden
  const [valorandoId, setValorandoId] = useState(null);
  const [miValoracion, setMiValoracion] = useState(0);
  const [miComentario, setMiComentario] = useState('');
  const [valoracionesHechas, setValoracionesHechas] = useState({});

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const token = localStorage.getItem('token');
        // Decodifica el token para obtener el id del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioId(payload.id || payload._id);

        const response = await api.get('/intercambio', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOfertas(response.data);
      } catch (error) {
        console.error('Error al cargar las ofertas:', error);
      }
    };
    fetchOfertas();
  }, []);

  useEffect(() => {
    const fetchValoraciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/valoraciones/mis-valoraciones', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Guardar las valoraciones hechas en un formato más específico
        const hechas = {};
        res.data.forEach((v) => {
          hechas[`${v.intercambio}-${v.usuario_valorador}`] = true;
        });
        setValoracionesHechas(hechas);
      } catch (error) {
        console.error('Error al cargar las valoraciones:', error);
      }
    };
    fetchValoraciones();
  }, [ofertas]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/intercambio/${id}/${nuevoEstado}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOfertas((prev) =>
        prev.map((oferta) =>
          oferta._id === id ? { ...oferta, estado: nuevoEstado } : oferta
        )
      );
    } catch (error) {
      alert('Error al actualizar el estado.');
    }
  };

  // Función para enviar valoración
  const handleEnviarValoracion = async (oferta, usuarioAValorarId) => {
    if (!miValoracion) return;
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/valoraciones',
        {
          usuario_valorado: usuarioAValorarId,
          estrellas: miValoracion,
          comentario: miComentario,
          intercambio: oferta._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMiValoracion(0);
      setMiComentario('');
      setValorandoId(null);
      setValoracionesHechas((v) => ({ ...v, [`${oferta._id}-${usuarioId}`]: true }));
      alert('¡Valoración enviada!');
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.mensaje); // Mensaje del backend
      } else {
        alert('Error al enviar la valoración');
      }
    }
  };

  // Ordenar las ofertas según el criterio seleccionado
  const ofertasOrdenadas = [...ofertas].sort((a, b) => {
    if (orden === 'reciente') {
      return new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt);
    } else if (orden === 'antiguo') {
      return new Date(a.fecha || a.createdAt) - new Date(b.fecha || b.createdAt);
    } else {
      return 0;
    }
  });

  // Filtrar por usuario, número y nombre
  const ofertasFiltradas = ofertasOrdenadas.filter(
    (oferta) =>
      (usuarioId === oferta.usuario_Origen?._id ||
        usuarioId === oferta.usuario_Destino?._id) &&
      (
        (busquedaNumero === '' ||
          oferta.decimo_Ofertado?.toString().includes(busquedaNumero) ||
          oferta.decimo_Solicitado?.toString().includes(busquedaNumero)
        ) &&
        (busquedaNombre === '' ||
          oferta.usuario_Origen?.nombre?.toLowerCase().includes(busquedaNombre.toLowerCase()) ||
          oferta.usuario_Destino?.nombre?.toLowerCase().includes(busquedaNombre.toLowerCase())
        )
      )
  );

  const ofertasSolicitadas = ofertasFiltradas.filter(o => o.estado === 'solicitada');
  const ofertasOtras = ofertasFiltradas.filter(o => o.estado !== 'solicitada');

  const tablaOfertas = (lista, titulo) => (
    <>
      <h3 style={{ marginTop: 30 }}>{titulo}</h3>
      {lista.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay ofertas.</p>
      ) : (
        <div
          style={{
            background: '#e0e0e0',
            borderRadius: 12,
            padding: 1,
            marginBottom: 20,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              background: 'white',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Ofertado</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Solicitado</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Origen</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Destino</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Estado</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Acción</th>
                <th style={{ textAlign: 'center', background: 'white', color: '#333', padding: 10 }}>Valoración</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((oferta) => {
                let puedeValorar = false;
                let usuarioAValorar = null;

                if (
                  oferta.estado === 'aceptada' &&
                  !valoracionesHechas[`${oferta._id}-${usuarioId}`] && // Verifica si el usuario ya valoró
                  (usuarioId === oferta.usuario_Origen?._id || usuarioId === oferta.usuario_Destino?._id) // Verifica si el usuario es origen o destino
                ) {
                  puedeValorar = true;
                  usuarioAValorar =
                    usuarioId === oferta.usuario_Origen?._id
                      ? oferta.usuario_Destino?._id
                      : oferta.usuario_Origen?._id;
                }

                return (
                  <tr key={oferta._id}>
                    <td style={{ padding: 8 }}>{oferta.decimo_Ofertado}</td>
                    <td style={{ padding: 8 }}>{oferta.decimo_Solicitado}</td>
                    <td style={{ padding: 8 }}>{oferta.usuario_Origen?.nombre || '-'}</td>
                    <td style={{ padding: 8 }}>{oferta.usuario_Destino?.nombre || '-'}</td>
                    <td style={{ padding: 8 }}>{oferta.estado}</td>
                    <td style={{ padding: 8 }}>
                      {oferta.estado === 'solicitada' && usuarioId === oferta.usuario_Destino?._id && (
                        <>
                          <button
                            style={{
                              marginRight: 8,
                              background: 'green',
                              color: 'white',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: 4,
                            }}
                            onClick={() => actualizarEstado(oferta._id, 'aceptar')}
                          >
                            Aceptar
                          </button>
                          <button
                            style={{
                              background: 'red',
                              color: 'white',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: 4,
                            }}
                            onClick={() => actualizarEstado(oferta._id, 'rechazar')}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {oferta.estado === 'solicitada' && usuarioId === oferta.usuario_Origen?._id && (
                        <button
                          style={{
                            background: 'gray',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: 4,
                          }}
                          onClick={() => actualizarEstado(oferta._id, 'cancelar')}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>
                      {puedeValorar ? (
                        valorandoId === oferta._id ? (
                          <div>
                            <StarRating value={miValoracion} onChange={setMiValoracion} />
                            <textarea
                              placeholder="Comentario (opcional)"
                              value={miComentario}
                              onChange={(e) => setMiComentario(e.target.value)}
                              style={{ width: '100%', marginTop: 4 }}
                              rows={2}
                            />
                            <button
                              style={{ marginTop: 4, fontSize: 12, padding: '2px 8px' }}
                              onClick={() => handleEnviarValoracion(oferta, usuarioAValorar)}
                            >
                              Enviar valoración
                            </button>
                            <button
                              style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px' }}
                              onClick={() => setValorandoId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            style={{ fontSize: 12, padding: '2px 8px' }}
                            onClick={() => setValorandoId(oferta._id)}
                          >
                            Valorar
                          </button>
                        )
                      ) : valoracionesHechas[`${oferta._id}-${usuarioId}`] ? (
                        'Valorado'
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <div
      style={{
        paddingLeft: '7%',
        paddingRight: '7%',
        paddingTop: 20,
        paddingBottom: '50px',
        backgroundColor: 'rgb(245, 245, 245)',
        minHeight: '100vh'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Mis Ofertas de Intercambio</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label htmlFor="orden" style={{ marginRight: 8 }}>Ordenar por:</label>
          <select
            id="orden"
            value={orden}
            onChange={e => setOrden(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
          </select>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Buscar por número..."
              value={busquedaNumero}
              onChange={e => {
                let valor = e.target.value.replace(/\D/g, '').slice(0, 5); // Máximo 5 dígitos
                setBusquedaNumero(valor);
              }}
              maxLength={5}
              style={{
                padding: '8px 28px 8px 8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '160px', // <-- Aumentado el ancho
                fontSize: '16px',
              }}
            />
            {busquedaNumero && (
              <span
                onClick={() => setBusquedaNumero('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                  fontWeight: 'bold',
                  fontSize: 18,
                  userSelect: 'none',
                  lineHeight: 1,
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Limpiar"
              >
                ×
              </span>
            )}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busquedaNombre}
              onChange={e => setBusquedaNombre(e.target.value)}
              style={{
                padding: '8px 28px 8px 8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '150px',
                fontSize: '16px',
              }}
            />
            {busquedaNombre && (
              <span
                onClick={() => setBusquedaNombre('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                  fontWeight: 'bold',
                  fontSize: 18,
                  userSelect: 'none',
                  lineHeight: 1,
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Limpiar"
              >
                ×
              </span>
            )}
          </div>
        </div>
      </div>
      {tablaOfertas(ofertasFiltradas.filter(o => o.estado === 'solicitada'), 'Ofertas solicitadas')}
      {tablaOfertas(ofertasFiltradas.filter(o => o.estado !== 'solicitada'), 'Ofertas finalizadas')}
    </div>
  );
};

export default MisOfertasIntercambio;
