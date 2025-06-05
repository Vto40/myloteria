import React from 'react';

const Home = () => {
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

      {/* Contenido centrado */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '80%',
          padding: '20px',
        }}
      >
        <h1 style={{ fontSize: '4rem', marginBottom: '0rem' }}>
          Bienvenido a la web de coleccionistas de lotería
        </h1>
        <p style={{ fontSize: '3rem' }}>
          Explora, colecciona e intercambia tus números favoritos.
        </p>
      </div>
    </div>
  );
};

export default Home;
