import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { extractContactInfo } from '../utils/contactInfo.js';
import '../styles/document.css';

function IconDocumentText() {
  return (
    <svg
      className="doc-empty-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.43H21l-5.47 3.97 2.09 6.43L12 14.87l-5.62 4 2.09-6.43L3 8.43h6.91z" />
    </svg>
  );
}

function SkeletonLoader() {
  return (
    <div className="doc-skeleton" role="status" aria-label="Generando adaptación…">
      <div className="skeleton-status">
        <span className="skeleton-status-dot" aria-hidden="true" />
        Analizando vacante y estructurando formato Harvard...
      </div>
      <div className="doc-skeleton-sheet">
        <div className="skeleton-block">
          <div className="skeleton-line --w-1-2" style={{ height: 20, margin: '0 auto 12px auto' }} />
          <div className="skeleton-line --w-3-4" style={{ margin: '0 auto' }} />
        </div>
        <div className="skeleton-block">
          <div className="skeleton-line --w-full" style={{ height: 2, marginBottom: 16 }} />
          <div className="skeleton-line --w-full" />
          <div className="skeleton-line --w-full" />
          <div className="skeleton-line --w-3-4" />
        </div>
      </div>
    </div>
  );
}

export default function DocumentPreview({ result, loading, cvText }) {
  const docRef = useRef(null);

  // Nombre y contacto salen del CV que subió cada usuario (sin datos por defecto)
  const headerInfo = useMemo(() => extractContactInfo(cvText), [cvText]);

  useEffect(() => {
    if (!result || !docRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.doc-badge-row', { opacity: 0, y: -8, duration: 0.28 })
        .from('.doc-sheet', { opacity: 0, y: 20, duration: 0.52 }, '-=0.12')
        .from('.harvard-section', { opacity: 0, y: 15, duration: 0.40, stagger: 0.08 }, '-=0.28');
    }, docRef);

    return () => ctx.revert();
  }, [result]);

  if (loading) {
    return (
      <section className="panel-preview" aria-label="Vista previa del CV adaptado">
        <SkeletonLoader />
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel-preview" aria-label="Vista previa del CV adaptado">
        <div className="doc-empty">
          <div className="doc-empty-icon-wrap">
            <IconDocumentText />
          </div>
          <span className="doc-empty-title">Tu CV adaptado aparece acá</span>
          <span className="doc-empty-hint">
            Cargá tu CV y la descripción de la vacante para generar una versión adaptada bajo formato Harvard y ATS.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={docRef}
      className="panel-preview"
      aria-label="Vista previa del CV adaptado"
    >
      {/* Etiqueta de aviso (se oculta al imprimir) */}
      <div className="doc-badge-row no-print">
        <span className="doc-ai-badge">
          <IconStar />
          Estándar Harvard & ATS Friendly
        </span>
      </div>

      {/* Hoja de vida estilo Harvard */}
      <article className="doc-sheet cv-sheet harvard-paper" aria-label="CV adaptado">
        {/* Encabezado Oficial */}
        <header className="harvard-header">
          {headerInfo.name && <h1 className="harvard-name">{headerInfo.name}</h1>}
          {headerInfo.contact && <p className="harvard-contact">{headerInfo.contact}</p>}
        </header>

        {/* Resumen Profesional */}
        <section className="harvard-section">
          <h2 className="harvard-title">Resumen Profesional</h2>
          <p className="harvard-paragraph">{result.resumen_adaptado}</p>
        </section>

        {/* Competencias Técnicas */}
        {result.palabras_clave_detectadas?.length > 0 && (
          <section className="harvard-section">
            <h2 className="harvard-title">Competencias Técnicas</h2>
            <p className="harvard-skills-row">
              <strong>Habilidades y Tecnologías Clave: </strong>
              {result.palabras_clave_detectadas.join(' • ')}
            </p>
          </section>
        )}

        {/* Educación */}
        {result.educacion?.length > 0 && (
          <section className="harvard-section">
            <h2 className="harvard-title">Educación</h2>
            {result.educacion.map((edu, idx) => (
              <div key={idx} className="harvard-item-row">
                <div className="harvard-item-left">
                  <strong>{edu.titulo}</strong> — <span>{edu.institucion}</span>
                </div>
                {edu.periodo && <div className="harvard-item-right">{edu.periodo}</div>}
              </div>
            ))}
          </section>
        )}

        {/* Certificaciones y Cursos */}
        {result.certificaciones?.length > 0 && (
          <section className="harvard-section">
            <h2 className="harvard-title">Certificaciones y Cursos</h2>
            <ul className="harvard-bullets">
              {result.certificaciones.map((cert, idx) => (
                <li key={idx} className="harvard-bullet">
                  {cert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Experiencia y Logros */}
        {result.experiencia_optimizada?.length > 0 && (
          <section className="harvard-section">
            <h2 className="harvard-title">Experiencia y Logros Relevantes</h2>
            <ul className="harvard-bullets">
              {result.experiencia_optimizada.map((item, index) => (
                <li key={index} className="harvard-bullet">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </section>
  );
}