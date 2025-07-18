import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StarRating = ({ value, onChange, readOnly = false, starClassName = '' }) => (
  <span>
    {[1,2,3,4,5].map(star => (
      <span
        key={star}
        className={starClassName}
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

const Intercambio = () => {
  const [numerosDisponibles, setNumerosDisponibles] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [numerosFiltrados, setNumerosFiltrados] = useState([]);
  const [modalNumero, setModalNumero] = useState(null);
  const [coleccion, setColeccion] = useState([]);
  const [numeroOfertado, setNumeroOfertado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [valoraciones, setValoraciones] = useState({});
  const [comentarios, setComentarios] = useState([]);
  const [showComentarios, setShowComentarios] = useState(false);
  const [valorandoId, setValorandoId] = useState(null);
  const [miValoracion, setMiValoracion] = useState(0);
  const [miComentario, setMiComentario] = useState('');
  const [ordenNumeros, setOrdenNumeros] = useState('asc'); // Estado para el orden de números

  useEffect(() => {
    const fetchNumerosDisponibles = async () => {
      try {
        const response = await api.get('/numeros-disponibles');
        setNumerosDisponibles(response.data);
        setNumerosFiltrados(response.data);
      } catch (error) {
        console.error('Error al cargar los números disponibles:', error);
        alert('Error al cargar los números disponibles.');
      }
    };

    const fetchColeccion = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/coleccion', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setColeccion(response.data);
      } catch (error) {
        console.error('Error al cargar tu colección:', error);
      }
    };

    // Obtener el id del usuario autenticado
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioId(payload.id || payload._id);
      } catch {}
    }

    fetchNumerosDisponibles();
    fetchColeccion();
  }, []);

  // Nueva función para cancelar el intercambio de un número propio
  const handleCancelarIntercambio = async (numeroObj) => {
    const confirmacion = window.confirm(`¿Seguro que quieres cancelar el intercambio del número ${numeroObj.numero}?`);
    if (!confirmacion) return;
    try {
      const token = localStorage.getItem('token');
      // Usar el endpoint correcto y el ID correcto
      await api.put(
        `/coleccion/${numeroObj._id || numeroObj.id}/no-disponible`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Actualiza la lista tras cancelar
      const response = await api.get('/numeros-disponibles');
      setNumerosDisponibles(response.data);
      setNumerosFiltrados(response.data);
    } catch (error) {
      console.error('Error al cancelar el intercambio:', error);
      alert('Error al cancelar el intercambio.');
    }
  };

  // Obtener media de valoraciones para todos los propietarios mostrados
  useEffect(() => {
    const fetchValoraciones = async () => {
      const ids = [...new Set(numerosDisponibles.map(n => n.propietario._id))];
      const vals = {};
      for (const id of ids) {
        const res = await api.get(`/valoraciones/media/${id}`);
        vals[id] = res.data;
      }
      setValoraciones(vals);
    };
    if (numerosDisponibles.length) fetchValoraciones();
  }, [numerosDisponibles]);

  // Función para mostrar comentarios de un usuario
  const handleVerComentarios = async (usuarioId) => {
    const res = await api.get(`/valoraciones/comentarios/${usuarioId}`);
    setComentarios(res.data);
    setShowComentarios(true);
  };

  // Función para enviar valoración
  const handleEnviarValoracion = async (usuarioId) => {
    if (!miValoracion) return;
    await api.post('/valoraciones', {
      usuario_valorado: usuarioId,
      estrellas: miValoracion,
      comentario: miComentario
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setMiValoracion(0);
    setMiComentario('');
    setValorandoId(null);
    // Refresca medias
    const res = await api.get(`/valoraciones/media/${usuarioId}`);
    setValoraciones(v => ({ ...v, [usuarioId]: res.data }));
  };

  const ordenarNumeros = () => {
    const numerosOrdenados = [...numerosFiltrados].sort((a, b) => {
      if (ordenNumeros === 'asc') {
        return a.numero - b.numero; // Ordenar de menor a mayor
      } else {
        return b.numero - a.numero; // Ordenar de mayor a menor
      }
    });
    setNumerosFiltrados(numerosOrdenados);
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Números Disponibles para Intercambio</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px', // Espaciado entre el buscador y el botón
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Buscar número..."
          value={filtro}
          onChange={(e) => {
            const valor = e.target.value.replace(/\D/g, '').slice(0, 5);
            setFiltro(valor);

            if (valor.length === 0) {
              setNumerosFiltrados(numerosDisponibles);
            } else {
              setNumerosFiltrados(
                numerosDisponibles.filter((numero) =>
                  numero.numero
                    .toString()
                    .padStart(5, '0')
                    .includes(valor.padStart(5, '0'))
                )
              );
            }
          }}
          maxLength={5}
          inputMode="numeric"
          pattern="\d{0,5}"
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '300px',
            fontSize: '16px',
          }}
        />

        <button
          onClick={() => {
            setOrdenNumeros(ordenNumeros === 'asc' ? 'desc' : 'asc');
            ordenarNumeros();
          }}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#1976d2',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Ordenar números ({ordenNumeros === 'asc' ? 'Ascendente' : 'Descendente'})
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(567px, 1fr))', // 567px = 15cm
          gap: '24px',
          justifyContent: 'center'
        }}
      >
        {numerosFiltrados.map((numero) => (
          <div
            key={numero._id}
            style={{
              width: '567px',
              height: '284px',
              maxWidth: '100%',
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              padding: '18px',
              border: '1.5px solid #bfa76f',
              borderRadius: '16px',
              backgroundColor: '#fffbe6',
              backgroundImage: 'url("https://www.loteria1benidorm.com/archivos/uploads/decimo-loteria-nacional-electronico.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxSizing: 'border-box',
              boxShadow: '0 4px 16px rgba(191,167,111,0.18)',
              overflow: 'hidden',
              aspectRatio: '2 / 1',
              margin: 'auto'
            }}
            onClick={e => {
              if (
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('button') ||
                e.target.closest('textarea') ||
                (e.target.classList && e.target.classList.contains('star-rating-star'))
              ) {
                return;
              }
              setModalNumero(numero);
              setMensaje('');
              setNumeroOfertado('');
            }}
          >
            {/* Botón cancelar como X arriba a la derecha */}
            {usuarioId && numero.propietario && (numero.propietario._id === usuarioId || numero.propietario.id === usuarioId) && (
              <button
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 14,
                  background: 'transparent',
                  color: '#e53935',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: 44, // <-- Más grande
                  fontWeight: 900,
                  cursor: 'pointer',
                  zIndex: 2,
                  lineHeight: 1,
                  width: 54,    // <-- Más grande
                  height: 54,   // <-- Más grande
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px #bfa76f33'
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleCancelarIntercambio(numero);
                }}
                title="Cancelar intercambio"
                aria-label="Cancelar intercambio"
              >
                ×
              </button>
            )}

            {/* Contenido principal */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              {/* Número arriba y grande */}
              <div style={{ marginTop: 0, marginBottom: 12 }}>
                <span style={{
                  fontSize: '3.6rem',
                  fontWeight: 900,
                  color: '#1a237e',
                  textShadow: '2px 2px 8px #fffbe6, 0 0 2px #000',
                  letterSpacing: 4,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 8,
                  padding: '2px 18px',
                  display: 'inline-block'
                }}>
                  {numero.numero}
                </span>
              </div>
              {/* Propietario más ancho y grande */}
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#222',
                marginBottom: 10,
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '2px 24px',
                display: 'inline-block',
                alignSelf: 'center',
                maxWidth: 340, // Más ancho para dejar espacio a valoraciones y botones
                minHeight: 48,
              }}>
                <div>Propietario:</div>
                <span style={{
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  display: 'inline-block'
                }}>
                  {numero.propietario.nombre}
                </span>
              </div>
              {/* Valoraciones y botón, siempre visibles y alineados abajo */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18
              }}>
                {/* Valoraciones */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 8,
                  padding: '2px 10px',
                  fontSize: 34 // Aumenta el tamaño de las estrellas
                }}>
                  <StarRating
                    value={Math.round(valoraciones[numero.propietario._id]?.media || 0)}
                    readOnly
                    starClassName="star-rating-star"
                  />
                  <span style={{ fontSize: 20, color: '#888', fontWeight: 500 }}>
                    ({valoraciones[numero.propietario._id]?.media?.toFixed(2) || '0.00'})
                  </span>
                </div>
                {/* Botón comentarios */}
                <button
                  style={{
                    fontSize: 18,
                    padding: '8px 22px',
                    height: 44,
                    background: '#fff',
                    border: '1.5px solid #bfa76f',
                    borderRadius: 8,
                    color: '#1a237e',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #bfa76f33'
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    handleVerComentarios(numero.propietario._id);
                  }}
                >
                  Ver comentarios
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalNumero && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 8,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModalNumero(null)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3>Información del número</h3>
            <p>
              <b>Número:</b> {modalNumero.numero}
            </p>
            <p>
              <b>Propietario:</b> {modalNumero.propietario.nombre}
            </p>
            {/* Quitado el email */}
            <hr />
            <h4>Realizar oferta de intercambio</h4>
            <div>
              <label htmlFor="oferta">
                Selecciona un número de tu colección:
              </label>
              <select
                id="oferta"
                value={numeroOfertado}
                onChange={(e) => setNumeroOfertado(e.target.value)}
                style={{
                  width: '100%',
                  padding: 6,
                  marginTop: 6,
                  marginBottom: 12,
                }}
              >
                <option value="">-- Selecciona tu número --</option>
                {coleccion.map((n) => (
                  <option key={n._id} value={n.numero}>
                    {n.numero.toString().padStart(5, '0')}
                  </option>
                ))}
              </select>
              <button
                disabled={!numeroOfertado}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 16px',
                  cursor: numeroOfertado ? 'pointer' : 'not-allowed',
                }}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const usuarioOrigenId = payload.id || payload._id;

                    if (usuarioOrigenId === modalNumero.propietario._id) {
                      setMensaje('No puedes hacer una oferta a ti mismo.');
                      return;
                    }

                    const yaExiste = await api.get('/intercambio', {
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    const existeOferta = yaExiste.data.some(
                      (oferta) =>
                        oferta.decimo_Solicitado === modalNumero.numero &&
                        oferta.usuario_Destino?._id === modalNumero.propietario._id &&
                        oferta.estado === 'solicitada'
                    );

                    if (existeOferta) {
                      setMensaje('Ya tienes una oferta pendiente para este número y usuario.');
                      return;
                    }

                    await api.post(
                      '/intercambio',
                      {
                        decimo_Ofertado: numeroOfertado,
                        decimo_Solicitado: modalNumero.numero,
                        usuario_Destino: modalNumero.propietario._id,
                        estado: 'solicitada',
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    setMensaje('¡Oferta enviada correctamente!');
                  } catch (error) {
                    setMensaje('Error al enviar la oferta.');
                  }
                }}
              >
                Realizar oferta
              </button>
              {mensaje && (
                <div
                  style={{
                    marginTop: 10,
                    color: mensaje.startsWith('¡') ? 'green' : 'red',
                  }}
                >
                  {mensaje}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de comentarios */}
      {showComentarios && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: 30, borderRadius: 8, maxWidth: 400, width: '90%' }}>
            <h3>Comentarios</h3>
            {comentarios.length === 0 && <p>No hay comentarios.</p>}
            <ul>
              {comentarios.map(c => (
                <li key={c._id} style={{ marginBottom: 8 }}>
                  <b>{c.usuario_valorador?.nombre || 'Usuario'}:</b> {c.estrellas}★<br />
                  {c.comentario}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowComentarios(false)}
              style={{ marginTop: 10, padding: '6px 16px', backgroundColor: '#888', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Intercambio;