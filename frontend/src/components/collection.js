// src/components/Collection.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(ArcElement, Tooltip, Legend);

const Collection = () => {
  const [coleccion, setColeccion] = useState([]);
  const [numero, setNumero] = useState('');
  const [pagina, setPagina] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [orden, setOrden] = useState('asc');
  const [busqueda, setBusqueda] = useState('');
  const [numeroBuscado, setNumeroBuscado] = useState(null);
  const [numeroSeleccionado, setNumeroSeleccionado] = useState(null);
  const [rangoInicio, setRangoInicio] = useState('');
  const [rangoFin, setRangoFin] = useState('');
  const [coleccionFiltrada, setColeccionFiltrada] = useState([]);
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: '', correo: '' });
  const token = localStorage.getItem('token');

  // Función para obtener la colección desde la API
  const fetchColeccion = useCallback(async () => {
    try {
      const response = await api.get('/coleccion', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        const coleccionOrdenada = ordenarColeccion(response.data, orden);
        setColeccion(coleccionOrdenada);
        setColeccionFiltrada(coleccionOrdenada);
      } else {
        console.error('La respuesta de la API no es un array:', response.data);
      }
    } catch (error) {
      console.error('Error al obtener la colección', error);
    }
  }, [token, orden]);

  const ordenarColeccion = (coleccion, orden) => {
    return orden === 'asc'
      ? [...coleccion].sort((a, b) => a.numero - b.numero)
      : [...coleccion].sort((a, b) => b.numero - a.numero);
  };

  useEffect(() => {
    if (token) {
      fetchColeccion();
    }
  }, [token, orden, fetchColeccion]);

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get('/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario({
          nombre: response.data.nombre,
          correo: response.data.correo,
        });
      } catch (error) {
        console.error('Error al obtener el usuario', error);
      }
    };
    if (token) fetchUsuario();
  }, [token]);

  const handleAddNumero = async (e) => {
    e.preventDefault();

    if (!/^\d{5}$/.test(numero)) {
      alert('Número inválido. Debe tener exactamente 5 dígitos (00000-99999).');
      return;
    }

    try {
      await api.post(
        '/coleccion',
        { numero },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Número añadido correctamente.');
      setNumero('');
      fetchColeccion();
    } catch (error) {
      console.error('Error al añadir el número', error);
      alert(error.response?.data?.mensaje || 'Error al añadir el número');
    }
  };

  const handleBuscarNumero = () => {
    const buscado = busqueda.padStart(5, '0');
    const index = coleccionFiltrada.findIndex(
      (n) => n.numero.toString().padStart(5, '0') === buscado
    );
    if (index !== -1) {
      setNumeroBuscado(buscado);
      const nuevaPagina = Math.floor(index / 100);
      setPagina(nuevaPagina);
    } else {
      alert('Número no encontrado en la colección.');
      setNumeroBuscado(null);
    }
  };

  const handleFiltrarPorRango = () => {
    if (!/^\d{5}$/.test(rangoInicio) || !/^\d{5}$/.test(rangoFin)) {
      alert('Ambos números del rango deben tener exactamente 5 dígitos (00000-99999).');
      return;
    }

    const inicio = parseInt(rangoInicio, 10);
    const fin = parseInt(rangoFin, 10);

    if (inicio > fin) {
      alert('El número inicial del rango debe ser menor o igual al número final.');
      return;
    }

    const nuevaColeccionFiltrada = coleccion.filter((n) => {
      const num = parseInt(n.numero, 10);
      return num >= inicio && num <= fin;
    });
    setColeccionFiltrada(nuevaColeccionFiltrada);
    setPagina(0);
  };

  const handleLimpiarFiltro = () => {
    setColeccionFiltrada(coleccion);
    setRangoInicio('');
    setRangoFin('');
    setPagina(0);
  };

  const handleMarcarIntercambio = async (numeroObj) => {
    try {
      await api.put(
        `/coleccion/${numeroObj._id}/disponible`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Número marcado como disponible para intercambio.');
      fetchColeccion();
    } catch (error) {
      console.error('Error al marcar el número para intercambio', error);
      alert('Error al marcar el número para intercambio.');
    }
  };

  // Posibilidad para un futuro, marcar decimos como deseados
  // const handleMarcarDeseado = async (numero) => {
  //   try {
  //     await api.post(
  //       '/deseados',
  //       { numero, fechaActualizacion: new Date().toISOString() },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert('Número marcado como deseado.');
  //   } catch (error) {
  //     console.error('Error al marcar el número como deseado', error);
  //     alert('Error al marcar el número como deseado.');
  //   }
  // };

  const handleEliminarNumero = async (numeroObj) => {
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar el número ${numeroObj.numero}?`);
    if (!confirmacion) return;

    try {
      await api.delete(`/coleccion/${numeroObj._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Número eliminado correctamente.');
      fetchColeccion();
    } catch (error) {
      console.error('Error al eliminar el número', error);
      alert('Error al eliminar el número.');
    }
  };

  const numerosPorPagina = 100;
  const totalPaginas = Math.ceil((coleccionFiltrada.length || 0) / numerosPorPagina);
  const numerosPaginados = coleccionFiltrada.slice(
    pagina * numerosPorPagina,
    (pagina + 1) * numerosPorPagina
  );

  // Calcula los datos para los gráficos
  const totalNumeros = coleccion.length;
  const numerosCapicuas = coleccion.filter((n) => {
    const numStr = n.numero.toString().padStart(5, '0');
    return numStr === numStr.split('').reverse().join('');
  }).length;
  const numerosPares = coleccion.filter((n) => Number(n.numero) % 2 === 0).length;
  const numerosImpares = totalNumeros - numerosPares;

  // Datos para los gráficos
  const dataEstadoTotal = {
    labels: ['Capicúas', 'Pares', 'Impares'],
    datasets: [
      {
        data: [numerosCapicuas, numerosPares, numerosImpares],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const dataCapicuas = {
    labels: ['Capicúas', 'No Capicúas'],
    datasets: [
      {
        data: [numerosCapicuas, totalNumeros - numerosCapicuas],
        backgroundColor: ['#FF6384', '#CCCCCC'],
      },
    ],
  };

  const dataPares = {
    labels: ['Pares', 'Impares'],
    datasets: [
      {
        data: [numerosPares, numerosImpares],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  const dataTotalNumeros = {
    labels: ['Total Números'],
    datasets: [
      {
        data: [totalNumeros],
        backgroundColor: ['#4CAF50'],
      },
    ],
  };

  // Calcula los números faltantes
  const numerosColeccion = coleccion.map(n => n.numero.toString().padStart(5, '0'));
  const faltantes = [];
  for (let i = 0; i <= 99999; i++) {
    const numStr = i.toString().padStart(5, '0');
    if (!numerosColeccion.includes(numStr)) {
      faltantes.push(numStr);
    }
  }

  // Números capicúas
  const capicuas = coleccion.filter(n => {
    const numStr = n.numero.toString().padStart(5, '0');
    return numStr === numStr.split('').reverse().join('');
  });

  // Números pares e impares
  const pares = coleccion.filter(n => Number(n.numero) % 2 === 0);
  const impares = coleccion.filter(n => Number(n.numero) % 2 !== 0);

  // Números disponibles para intercambio
  const intercambio = coleccion.filter(n => n.intercambio);

  const generarPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(26);
    doc.text('MYLOTERIA', 100, 15,  { align: 'center' }   ); 
    doc.setFontSize(16);
    
    doc.text('Informe de la Colección del 00000 al 99999', 10, 35);
    let y = 55;
    doc.setFontSize(12);
    doc.text(`- Usuario: ${usuario.nombre || 'Desconocido'}`, 10, y); y += 12;
    doc.text(`- Email: ${usuario.correo || 'Desconocido'}`, 10, y); y += 12;
    doc.text(`- Fecha: ${new Date().toLocaleDateString()}`, 10, y); y += 12;
    doc.text(`- Total de números en la colección: ${coleccion.length}`, 10, y); y += 12;
    doc.text(`- Números faltantes: ${faltantes.length}`, 10, y); y += 12;
    doc.text(`- Números capicúas: ${capicuas.length}`, 10, y); y += 12;
    doc.text(`- Números pares: ${pares.length}`, 10, y); y += 12;
    doc.text(`- Números impares: ${impares.length}`, 10, y); y += 12;
    doc.text(`- Números disponibles para intercambio: ${intercambio.length}`, 10, y); y += 12;



    // Captura los gráficos y añádelos al PDF
    const chartDiv = document.getElementById('graficos-pdf');
    if (chartDiv) {
      const canvas = await html2canvas(chartDiv);
      const imgData = canvas.toDataURL('image/png');
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Gráfico de la colección', 10, 15);
      doc.addImage(imgData, 'PNG', 10, 25, 380, 90);
    }

    doc.save('informe-coleccion.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mi Colección</h2>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <form onSubmit={handleAddNumero} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Añadir número (00000-99999)"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            maxLength="5"
            style={{ padding: '5px', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '5px 10px' }}>Añadir</button>
        </form>
        <select
          id="orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            placeholder="Buscar número"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            maxLength="5"
            style={{ padding: '5px 25px 5px 5px', width: '150px' }}
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#888',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              tabIndex={-1}
            >
              ×
            </button>
          )}
        </div>
        <button onClick={handleBuscarNumero} style={{ padding: '5px 10px' }}>Buscar</button>
        <input
          type="text"
          placeholder="Desde (00000)"
          value={rangoInicio}
          onChange={(e) => setRangoInicio(e.target.value)}
          maxLength="5"
          style={{ padding: '5px', width: '100px' }}
        />
        <input
          type="text"
          placeholder="Hasta (99999)"
          value={rangoFin}
          onChange={(e) => setRangoFin(e.target.value)}
          maxLength="5"
          style={{ padding: '5px', width: '100px' }}
        />
        <button onClick={handleFiltrarPorRango} style={{ padding: '5px 10px' }}>Filtrar</button>
        <button onClick={handleLimpiarFiltro} style={{ padding: '5px 10px', backgroundColor: 'gray', color: 'white' }}>
          Limpiar Filtro
        </button>
      </div>

      {/* Sección de gráficos para PDF */}
      <div
        id="graficos-pdf"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ width: 200, minWidth: 0 }}>
          <h4 style={{ textAlign: 'center', fontSize: 15 }}>Estado Total</h4>
          <Pie data={dataEstadoTotal} options={{ maintainAspectRatio: false, responsive: false }} width={200} height={200} />
        </div>
        <div style={{ width: 200, minWidth: 0 }}>
          <h4 style={{ textAlign: 'center', fontSize: 15 }}>Total de Números</h4>
          <Doughnut data={dataTotalNumeros} options={{ maintainAspectRatio: false, responsive: false }} width={200} height={200} />
        </div>
      </div>

      <div>
        <h3>Página {pagina + 1} de {totalPaginas}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Array.from({ length: 10 }).map((_, filaIndex) => (
              <tr key={filaIndex}>
                {Array.from({ length: 10 }).map((_, colIndex) => {
                  const index = filaIndex * 10 + colIndex;
                  const numeroObj = numerosPaginados[index];
                  const esBuscado = numeroObj?.numero?.toString().padStart(5, '0') === numeroBuscado;
                  return (
                    <td
                      key={colIndex}
                      style={{
                        border: '1px solid #ddd',
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: '14px',
                        cursor: numeroObj ? 'pointer' : 'default',
                        backgroundColor: esBuscado ? 'yellow' : 'transparent',
                      }}
                      onClick={() => {
                        if (numeroObj) {
                          setNumeroSeleccionado(numeroObj);
                        }
                      }}
                    >
                      {numeroObj !== undefined ? numeroObj.numero.toString().padStart(5, '0') : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {numeroSeleccionado !== null && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd' }}>
            <h4>Información del número: {numeroSeleccionado.numero.toString().padStart(5, '0')}</h4>
            <button
              onClick={() => handleMarcarIntercambio(numeroSeleccionado)}
              style={{ marginRight: '10px', padding: '5px 10px' }}
            >
              Marcar como disponible para intercambio
            </button>
            {/* <button
              onClick={() => handleMarcarDeseado(numeroSeleccionado)}
              style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: 'blue', color: 'white' }}
            >
              Marcar como deseado
            </button> */}
            <button
              onClick={() => handleEliminarNumero(numeroSeleccionado)}
              style={{ padding: '5px 10px', backgroundColor: 'blue', color: 'white' }}
            >
              Eliminar número de la colección
            </button>
          </div>
        )}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setPagina((p) => Math.max(p - 1, 0))}
            disabled={pagina === 0}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Anterior
          </button>
          <button
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas - 1))}
            disabled={pagina === totalPaginas - 1}
            style={{ padding: '5px 10px' }}
          >
            Siguiente
          </button>
        </div>
      </div>

      <button
        onClick={generarPDF}
        style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Generar informe PDF
      </button>

      {mostrarInforme && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: 30, borderRadius: 8, maxWidth: 600, width: '90%' }}>
            <h2>Informe de la Colección</h2>
            <div style={{ marginBottom: 10 }}>
              <b>Usuario:</b> {usuario.nombre} <br />
              <b>Email:</b> {usuario.correo}
            </div>
            <ul>
              <li><b>Total de números en la colección:</b> {coleccion.length}</li>
              <li><b>Números faltantes:</b> {faltantes.length}</li>
              <li><b>Números capicúas:</b> {capicuas.length}</li>
              <li><b>Números pares:</b> {pares.length}</li>
              <li><b>Números impares:</b> {impares.length}</li>
              <li><b>Números disponibles para intercambio:</b> {intercambio.length}</li>
              {/* Si tienes deseados: */}
              {/* <li><b>Números deseados:</b> {deseados.length}</li> */}
            </ul>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 10 }}>
              <b>Primeros 50 números faltantes:</b>
              <div style={{ fontSize: 12, color: '#555' }}>
                {faltantes.slice(0, 50).join(', ')}
                {faltantes.length > 50 && ' ...'}
              </div>
            </div>
            {/* Gráficos agregados al informe */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, gap: 20 }}>
              <div style={{ width: 380 }}>
                <h4 style={{ textAlign: 'center', fontSize: 15 }}>Total de Números</h4>
                <Doughnut data={dataTotalNumeros} options={{ maintainAspectRatio: false, responsive: false }} width={180} height={180} />
              </div>
              <div style={{ width: 380 }}>
                <h4 style={{ textAlign: 'center', fontSize: 15 }}>Estado Total</h4>
                <Pie data={dataEstadoTotal} options={{ maintainAspectRatio: false, responsive: false }} width={180} height={180} />
              </div>
            </div>
            
            <button
              onClick={() => setMostrarInforme(false)}
              style={{ marginTop: 20, padding: '6px 16px', backgroundColor: '#888', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
