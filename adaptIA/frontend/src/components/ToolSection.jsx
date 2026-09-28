import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import html2pdf from 'html2pdf.js';
import InputPanel from './InputPanel.jsx';
import DocumentPreview from './DocumentPreview.jsx';
import '../styles/taller.css';

export default function ToolSection(props) {
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.taller-header', { opacity: 0, y: -10, duration: 0.36 })
          .from('.panel-input', { opacity: 0, x: -20, duration: 0.52 }, '-=0.18')
          .from('.panel-preview', { opacity: 0, x: 20, duration: 0.52 }, '<');

        observer.disconnect();
      },
      { threshold: 0.06 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Función de descarga directa a PDF
  const handleDownloadPDF = () => {
    const element = document.querySelector('.harvard-paper');
    if (!element) return;

    const opt = {
      margin: [10, 12, 10, 12], // márgenes en mm (arriba, derecha, abajo, izquierda)
      filename: 'CV_adaptado.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <section ref={sectionRef} className="taller" id="taller" aria-label="Taller de adaptación de CV">
      <div className="taller-header">
        <div className="taller-header-left">
          <button className="taller-back-btn" onClick={() => navigate('/')} aria-label="Volver al inicio">
            ← Inicio
          </button>
          <span className="taller-badge" aria-label="Herramienta activa">
            <span className="taller-badge-dot" aria-hidden="true" />
            El taller
          </span>
          <h2 className="taller-title">Armá tu versión para esta vacante</h2>
        </div>

        <div className="taller-header-right">
          {props.result && (
            <button
              type="button"
              className="taller-btn-descargar no-print"
              onClick={handleDownloadPDF}
              aria-label="Descargar CV en PDF"
            >
              Descargar PDF
            </button>
          )}
        </div>
      </div>

      <div className="taller-body">
        <div className="app-main">
          <InputPanel {...props} />
          <DocumentPreview result={props.result} loading={props.loading} cvText={props.cvText} />
        </div>
      </div>
    </section>
  );
}