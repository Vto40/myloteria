import React, { useEffect, useState } from 'react';
import api from '../services/api';

const MisOfertasIntercambio = () => {
  const [ofertas, setOfertas] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const token = localStorage.getItem('token');
        // Decodifica el token para obtener el id del usuario (puedes usar jwt-decode)
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

  // Filtrar por usuario y búsqueda
  const ofertasFiltradas = ofertas.filter(
    (oferta) =>
      (usuarioId === oferta.usuario_Origen?._id ||
        usuarioId === oferta.usuario_Destino?._id) &&
      (
        oferta.decimo_Ofertado?.toString().includes(busqueda) ||
        oferta.decimo_Solicitado?.toString().includes(busqueda) ||
        oferta.usuario_Origen?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        oferta.usuario_Destino?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
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
              </tr>
            </thead>
            <tbody>
              {lista.map((oferta) => (
                <tr
                  key={oferta._id}
                  style={{
                    background: 'white',
                    textAlign: 'center',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <td style={{ padding: 8 }}>{oferta.decimo_Ofertado}</td>
                  <td style={{ padding: 8 }}>{oferta.decimo_Solicitado}</td>
                  <td style={{ padding: 8 }}>{oferta.usuario_Origen?.nombre || '-'}</td>
                  <td style={{ padding: 8 }}>{oferta.usuario_Destino?.nombre || '-'}</td>
                  <td style={{ padding: 8 }}>{oferta.estado}</td>
                  <td style={{ padding: 8 }}>
                    {oferta.estado === 'solicitada' && usuarioId === oferta.usuario_Destino?._id && (
                      <>
                        <button
                          style={{ marginRight: 8, background: 'green', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4 }}
                          onClick={() => actualizarEstado(oferta._id, 'aceptar')}
                        >
                          Aceptar
                        </button>
                        <button
                          style={{ background: 'red', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4 }}
                          onClick={() => actualizarEstado(oferta._id, 'rechazar')}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {oferta.estado === 'solicitada' && usuarioId === oferta.usuario_Origen?._id && (
                      <button
                        style={{ background: 'gray', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4 }}
                        onClick={() => actualizarEstado(oferta._id, 'cancelar')}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <div style={{ padding: 20, backgroundColor: 'rgb(245, 245, 245)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Mis Ofertas de Intercambio</h2>
        <input
          type="text"
          placeholder="Buscar por número o nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '300px',
            fontSize: '16px',
          }}
        />
      </div>
      {tablaOfertas(ofertasSolicitadas, 'Ofertas solicitadas')}
      {tablaOfertas(ofertasOtras, 'Ofertas finalizadas')}
    </div>
  );
};

export default MisOfertasIntercambio;