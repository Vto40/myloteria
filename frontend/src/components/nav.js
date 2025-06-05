import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Nav = ({ token, setToken }) => {
    const navigate = useNavigate();
    const [esAdmin, setEsAdmin] = useState(false);

    useEffect(() => {
        const fetchPerfil = async () => {
            if (!token) {
                setEsAdmin(false);
                return;
            }
            try {
                const res = await api.get('/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEsAdmin(res.data.esAdministrador === true); // <- así se llama en la base de datos
            } catch {
                setEsAdmin(false);
            }
        };
        fetchPerfil();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token del almacenamiento local
        setToken(null); // Actualiza el estado del token
        navigate('/'); // Redirige al usuario al home
    };

    return (
        <nav style={{ padding: '10px', background: '#333', color: 'white' }}>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '15px' }}>
                <li>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                        Home
                    </Link>
                </li>
                {!token ? (
                    <>
                        <li>
                            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/registro" style={{ color: 'white', textDecoration: 'none' }}>
                                Registro
                            </Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/perfil" style={{ color: 'white', textDecoration: 'none' }}>
                                Mi Perfil
                            </Link>
                        </li>
                        <li>
                            <Link to="/coleccion" style={{ color: 'white', textDecoration: 'none' }}>
                                Mi Colección
                            </Link>
                        </li>
                        <li>
                            <Link to="/intercambio" style={{ color: 'white', textDecoration: 'none' }}>
                                Mi Área de Intercambio
                            </Link>
                        </li>
                        <li>
                            <a href="/mis-ofertas-intercambio" style={{ color: 'white', textDecoration: 'none' }}>
                                Mis Ofertas de Intercambio
                            </a>
                        </li>
                        {esAdmin && (
                            <li>
                                <Link to="/administrador" style={{ color: '#ffb300', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Administración
                                </Link>
                            </li>
                        )}
                        <li>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    fontSize: 'inherit', // Coincide con el tamaño de fuente
                                    fontFamily: 'inherit', // Coincide con la fuente
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Nav;