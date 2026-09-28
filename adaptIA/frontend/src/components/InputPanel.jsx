import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import '../styles/input-panel.css';

/* ────────────────────────────────────────────────────────────────────────────
   SVG icons — inline, zero external deps.
   Phosphor-style: ultra-light 1.5 stroke, consistent sizing.
   ────────────────────────────────────────────────────────────────────────── */
function IconUpload() {
  return (
    <svg
      className="dropzone-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="8" x2="12" y2="20" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg
      className="field-label-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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

function IconBriefcase() {
  return (
    <svg
      className="field-label-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l2.09 6.43H21l-5.47 3.97 2.09 6.43L12 14.87l-5.62 4 2.09-6.43L3 8.43h6.91z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Ripple hook — creates click-wave feedback.
   Purpose: feedback (confirms the interface heard the user).
   Duration 650ms — rare/explicit action, delight tier is allowed here.
   ────────────────────────────────────────────────────────────────────────── */
function useRipple() {
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const id   = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
    ]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  };

  return { ripples, createRipple };
}

/* ────────────────────────────────────────────────────────────────────────────
   InputPanel component
   ────────────────────────────────────────────────────────────────────────── */
export default function InputPanel({
  cvText,
  jobDescription,
  onCvTextChange,
  onJobDescriptionChange,
  onUploadCv,
  onSubmit,
  loading,
  error,
}) {
  const fileInputRef  = useRef(null);
  const panelRef      = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const { ripples, createRipple } = useRipple();

  /* ── GSAP stagger-in on mount ─────────────────────────────────────────────
     Purpose: spatial consistency — reveals the form in reading order.
     Tier: first-time / orientation.
     Tool: GSAP (JS needed for stagger targeting inside a sticky panel).
     Properties: opacity + transform — GPU safe.
     Curve: power3.out — strong ease-out as per user spec.
     Duration: 420ms per field, stagger 0.09s.
     prefers-reduced-motion: respects global reduced-motion CSS override.
  ──────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!panelRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.from('.field-group, .input-panel-header, .btn-primary', {
        opacity:  0,
        y:        14,
        duration: 0.42,
        stagger:  0.09,
        ease:     'power3.out',
        clearProps: 'all',
      });
    }, panelRef);

    return () => ctx.revert();
  }, []);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  function handleFile(file) {
    if (!file) return;
    setUploadedFile(file);
    onUploadCv(file);
  }

  function handleButtonClick(e) {
    createRipple(e);
    onSubmit();
  }

  const cvCharCount = cvText.length;
  const jdCharCount = jobDescription.length;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <section
      ref={panelRef}
      className="panel-input"
      aria-label="Formulario de adaptación de CV"
    >
      {/* ── Panel header ─────────────────────────────────────────────────── */}
      <div className="input-panel-header">
        <p className="input-panel-title">Configurar adaptación</p>
      </div>

      {/* ── CV field ──────────────────────────────────────────────────────── */}
      <div className="field-group">
        <label className="field-label" htmlFor="cv-textarea">
          <IconFile />
          Tu CV
        </label>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Subir CV — arrastrá un archivo o hacé click"
          className={`dropzone${dragOver ? ' dropzone--active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => { if (!uploadedFile) fileInputRef.current?.click(); }}
          onKeyDown={(e) => e.key === 'Enter' && !uploadedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            aria-hidden="true"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {uploadedFile ? (
            <div className="uploaded-file-card">
              <div className="uploaded-file-info">
                <IconFile />
                <div className="uploaded-file-text">
                  <span className="uploaded-file-name">{uploadedFile.name.length > 30 ? uploadedFile.name.substring(0, 27) + '...' : uploadedFile.name}</span>
                  <span className="uploaded-file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <button
                type="button"
                className="uploaded-file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Eliminar archivo"
              >
                <IconX />
              </button>
            </div>
          ) : (
            <>
              <IconUpload />
              <span className="dropzone-title">Soltá tu CV o hacé click para subirlo</span>
              <span className="dropzone-hint">PDF, DOCX o TXT</span>
            </>
          )}
        </div>

        {/* Or divider */}
        <div className="field-divider">
          <div className="field-divider-line" />
          <span className="field-divider-text">o pegá el texto</span>
          <div className="field-divider-line" />
        </div>

        {/* Textarea */}
        <textarea
          id="cv-textarea"
          className="text-field"
          rows={8}
          placeholder="Pegá el texto de tu CV directamente acá…"
          value={cvText}
          onChange={(e) => onCvTextChange(e.target.value)}
          aria-label="Texto de tu CV"
          aria-describedby={cvCharCount > 0 ? 'cv-char-count' : undefined}
        />
        <div className="field-footer">
          <span
            id="cv-char-count"
            className={`field-char-count${cvCharCount > 8000 ? ' --warn' : ''}`}
            aria-live="polite"
          >
            {cvCharCount > 0 ? `${cvCharCount.toLocaleString('es-AR')} caracteres` : ''}
          </span>
        </div>
      </div>

      {/* ── Job description field ──────────────────────────────────────────── */}
      <div className="field-group">
        <label className="field-label" htmlFor="jd-textarea">
          <IconBriefcase />
          Descripción de la vacante
        </label>
        <textarea
          id="jd-textarea"
          className="text-field"
          rows={8}
          placeholder="Pegá el aviso completo: puesto, requisitos, responsabilidades…"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          aria-label="Descripción de la vacante"
          aria-describedby={jdCharCount > 0 ? 'jd-char-count' : undefined}
        />
        <div className="field-footer">
          <span
            id="jd-char-count"
            className={`field-char-count${jdCharCount > 6000 ? ' --warn' : ''}`}
            aria-live="polite"
          >
            {jdCharCount > 0 ? `${jdCharCount.toLocaleString('es-AR')} caracteres` : ''}
          </span>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <p className="field-error" role="alert" aria-live="assertive">
          <IconAlertCircle />
          {error}
        </p>
      )}

      {/* ── Submit button — button-in-button architecture ─────────────────── */}
      <button
        id="btn-tailor"
        type="button"
        className="btn-primary"
        onClick={handleButtonClick}
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? 'Adaptando tu CV…' : 'Adaptar CV a esta vacante'}
      >
        {/* Ripple waves */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="btn-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            aria-hidden="true"
          />
        ))}

        {loading ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            Adaptando…
          </>
        ) : (
          <>
            {/* Button-in-button trailing icon */}
            <span className="btn-icon-circle" aria-hidden="true">
              <IconSparkle />
            </span>
            Adaptar CV a esta vacante
          </>
        )}
      </button>
    </section>
  );
}
