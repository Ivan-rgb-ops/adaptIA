import React from 'react';
import GlyphPortal from './GlyphPortal.jsx';
import MeshDriftShader from './MeshDriftShader.jsx';
import '../styles/adaptia-zoom.css';

function Corners() {
  return (
    <>
      <div className="adaptia-corner adaptia-corner-tl" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none">
          <path d="M10 0V1H1V10H0V0H10Z" fill="currentColor" />
        </svg>
      </div>
      <div className="adaptia-corner adaptia-corner-tr" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none">
          <path d="M10 0V10H9V1H0V0H10Z" fill="currentColor" />
        </svg>
      </div>
      <div className="adaptia-corner adaptia-corner-bl" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none">
          <path d="M0 0L1 0L1 9L10 9L10 10L0 10L0 0Z" fill="currentColor" />
        </svg>
      </div>
      <div className="adaptia-corner adaptia-corner-br" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 10 10" fill="none">
          <path d="M10 10L0 10L0 9L9 9L9 0L10 0L10 10Z" fill="currentColor" />
        </svg>
      </div>
    </>
  );
}

export function AdaptiaZoomAnimation({
  title = 'Cada postulación es única. Tu CV también debería serlo.',
  subtitle = (
    <>
      Pará de mandar el mismo CV a todos los puestos y empezá a{' '}
      <span className="adaptia-accent">adaptar</span> cada versión en segundos.{' '}
      Nuestra <span className="adaptia-accent">lectura</span> de la vacante
      resalta lo que importa, y convierte tu experiencia en una historia{' '}
      <span className="adaptia-accent">enfocada</span>.
    </>
  ),
  outroTitle = (
    <>
      Tu próximo <br className="adaptia-title-break" />
      trabajo te <span className="adaptia-accent">espera.</span>
    </>
  ),
  outroSubtitle = (
    <>
      Subí tu CV, pegá el aviso y recibí una versión{' '}
      <span className="adaptia-accent">hecha para ese puesto</span>, con palabras
      clave y carta de presentación.
    </>
  ),
  className = '',
}) {
  return (
    <div className={`adaptia-zoom-root ${className}`.trim()}>
      {/* 1. SECCIÓN INTRO */}
      <section className="adaptia-intro-section">
        <div className="adaptia-intro-container">
          <h1 className="adaptia-intro-title">{title}</h1>
          <p className="adaptia-intro-subtitle">{subtitle}</p>
        </div>
      </section>

      {/* 2. ZOOM CON GLYPH-PORTAL "ADAPTIA" + WEBGL MESH DRIFT SHADER */}
      <GlyphPortal
        word="ADAPTIA"
        scrollLength={2.4}
        interactive={true}
        fontFamily='"Arial Black", "Arial", sans-serif'
        fontWeight={900}
        annotations={false}
        front={<Corners />}
        showCaption={false}
        style={{
          '--gp-paper': 'var(--az-bg, #F7F6F1)',
          '--gp-ink': 'var(--az-text, #11110F)',
          '--gp-field': '#10002B',
          '--gp-foreground': '#F7F6F1',
        }}
        background={<MeshDriftShader />}
      />

      {/* 3. SECCIÓN OUTRO */}
      <footer className="adaptia-outro-section">
        <div className="adaptia-outro-container">
          <h2 className="adaptia-outro-title">{outroTitle}</h2>
          <p className="adaptia-outro-subtitle">{outroSubtitle}</p>
        </div>
      </footer>
    </div>
  );
}

export default AdaptiaZoomAnimation;
