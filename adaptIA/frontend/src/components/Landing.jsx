import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroScanner from './HeroScanner.jsx';
import AdaptiaZoomAnimation from './AdaptiaZoomAnimation.jsx';
import '../styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────────────────
   SVG icons — inline, zero deps, Phosphor-light style (1.4–1.6 stroke).
   ────────────────────────────────────────────────────────────────────────── */

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 2l2.09 6.43H21l-5.47 3.97 2.09 6.43L12 14.87l-5.62 4 2.09-6.43L3 8.43h6.91z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}


/* ────────────────────────────────────────────────────────────────────────────
   Landing component
   ────────────────────────────────────────────────────────────────────────── */
export default function Landing({ onGoToTool }) {
  const rootRef = useRef(null);

  /* ── GSAP ScrollTrigger animations ───────────────────────────────────────
     All animations use transform + opacity only (GPU-safe, Apple rule).
     prefers-reduced-motion: checked before any GSAP runs.

     1. Fade-blur-up reveals (gsap-reveal class)
        Purpose: spatial consistency — elements enter from below in sequence.
        Curve: power3.out — strong ease-out, feels natural.
        Blur: starts at 4px, resolves to 0 — Apple blur-in effect.

     2. Word scrub on the reveal section
        Purpose: explanation — directs reading in sequence.
        Tool: ScrollTrigger scrub (GSAP) — scroll progress drives opacity.

     3. Stagger bento cards
        Purpose: hierarchy — most important card is already visible,
                 supporting cards cascade in.
  ──────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      // In reduced-motion: just show everything immediately
      gsap.set('.gsap-reveal', { opacity: 1, y: 0, filter: 'blur(0px)' });
      gsap.set('.land-word', { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      /* ── 1. Fade-blur-up for all .gsap-reveal elements ── */
      const revealEls = gsap.utils.toArray('.gsap-reveal');
      revealEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'will-change',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      /* ── 2. Hero elements stagger — fire on load (not scroll) ── */
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.land-eyebrow', { opacity: 0, y: -10, duration: 0.5 }, 0.2)
        .from('.land-hero-sub', { opacity: 0, y: 16, duration: 0.6 }, 0.55)
        .from('.land-hero-actions', { opacity: 0, y: 12, duration: 0.5 }, 0.7)
        .from('.land-hero-trust', { opacity: 0, duration: 0.5 }, 0.85)
        .from('.land-mockup', { opacity: 0, x: 32, filter: 'blur(8px)', duration: 0.9 }, 0.4);

      /* ── 3. Bento cards stagger ── */
      gsap.from('.land-card', {
        opacity: 0,
        y: 20,
        filter: 'blur(3px)',
        duration: 0.55,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power3.out',
        clearProps: 'will-change',
        scrollTrigger: {
          trigger: '.land-bento',
          start: 'top 85%',
        },
      });

      /* ── 4. Process steps stagger ── */
      gsap.from('.land-step', {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.land-process',
          start: 'top 85%',
        },
      });

      /* ── 5. Word-by-word scrub reveal (gpt-taste: scrubbing text reveal) ──
         Each .land-word opacity scrubs 0.15→1 sequentially as user scrolls.
         This is the Apple "text reveal as you scroll" pattern.
      ── */
      const words = gsap.utils.toArray('.land-word');
      if (words.length > 0) {
        gsap.to(words, {
          opacity: 1,
          stagger: { each: 0.04 },
          ease: 'none',
          scrollTrigger: {
            trigger: '.land-reveal-section',
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1.5,
          },
        });
      }

      /* ── 6. CTA section ── */
      gsap.from('.land-cta-inner', {
        opacity: 0,
        y: 30,
        filter: 'blur(6px)',
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.land-cta-section',
          start: 'top 80%',
        },
      });

    }, root);

    return () => ctx.revert();
  }, []);

  /* ── Scroll helper ─────────────────────────────────────────────────────── */
  function handleCta() {
    if (typeof onGoToTool === 'function') {
      onGoToTool();
    } else {
      document.getElementById('taller')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div ref={rootRef} className="landing-root" aria-label="adaptIA — página principal">

      {/* ── Floating navbar ─────────────────────────────────────────────── */}
      <nav className="land-nav" aria-label="Navegación principal">
        <span className="land-nav-logo" aria-label="adaptIA">
          adapt<span>IA</span>
        </span>

        <div className="land-nav-links">
          <button className="land-nav-link" onClick={() =>
            document.querySelector('.land-bento')?.scrollIntoView({ behavior: 'smooth' })
          }>
            Características
          </button>
          <button className="land-nav-link" onClick={() =>
            document.querySelector('.land-process')?.scrollIntoView({ behavior: 'smooth' })
          }>
            Cómo funciona
          </button>
        </div>

        <button className="land-nav-cta" onClick={handleCta} aria-label="Probar adaptIA">
          Probar ahora
        </button>
      </nav>

      {/* ────────────────────────────────────────────────────────────────────
          ATTENTION — Hero
          Architecture: Artistic Asymmetry (text left / mockup right)
          H1: max 2–3 lines guaranteed at clamp(3.2rem, 6vw, 6rem)
          ────────────────────────────────────────────────────────────────── */}
      <section className="land-hero" aria-label="Hero">
        {/* Ambient glows */}
        <div className="land-hero-glow" aria-hidden="true" />
        <div className="land-hero-glow-silver" aria-hidden="true" />

        <div className="land-hero-inner">
          {/* Left — copy */}
          <div className="land-hero-copy">
            <div className="land-eyebrow" aria-label="Impulsado por IA">
              <span className="land-eyebrow-dot" aria-hidden="true" />
              Impulsado por IA
            </div>

            <h1 id="hero-heading" className="land-h1">
              Adaptá tu CV a cada
              <br />
              <span className="land-h1-accent">puesto en segundos</span>
            </h1>

            <p className="land-hero-sub">
              Subí tu CV y la descripción del puesto. adaptIA genera un resumen
              profesional, palabras clave y carta de presentación enfocados
              en exactamente lo que esa empresa busca.
            </p>

            <div className="land-hero-actions">
              <button
                className="land-btn-primary"
                onClick={handleCta}
                aria-label="Empezar a adaptar mi CV"
              >
                <span className="land-btn-icon" aria-hidden="true">
                  <IconArrow />
                </span>
                Empezar ahora
              </button>

              <button
                className="land-btn-ghost"
                onClick={() =>
                  document.querySelector('.land-process')?.scrollIntoView({ behavior: 'smooth' })
                }
                aria-label="Ver cómo funciona"
              >
                Cómo funciona
                <IconChevronRight />
              </button>
            </div>

            <div className="land-hero-trust" aria-label="Información de privacidad">
              <div className="land-hero-trust-avatars" aria-hidden="true">
                {['IV', 'AM', 'PG'].map((init) => (
                  <div key={init} className="land-hero-trust-avatar">{init}</div>
                ))}
              </div>
              100% Open Source.
            </div>
          </div>

          {/* Right — macOS mockup */}
          <div className="land-hero-visual" aria-hidden="true">
            <div className="land-mockup" role="img" aria-label="Vista previa de la interfaz de adaptIA">
              {/* macOS traffic lights */}
              <div className="land-mockup-topbar">
                <div className="land-mockup-dot --red" />
                <div className="land-mockup-dot --yellow" />
                <div className="land-mockup-dot --green" />
              </div>
              <HeroScanner />
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          INTEREST — Features Bento
          Grid math: Row 1: 7+5=12 ✓  Row 2: 5+7=12 ✓  grid-flow-dense ✓
          ────────────────────────────────────────────────────────────────── */}
      <div className="land-section-full">
        <div className="land-section">
          <span className="land-section-label gsap-reveal">Características</span>
          <h2 className="land-h2 gsap-reveal">
            Diseñado para que la IA trabaje para vos
          </h2>
          <p className="land-section-sub gsap-reveal">
            Sin plantillas genéricas. Sin copy-paste. El output es específico
            para el puesto y la empresa.
          </p>

          <div className="land-bento" role="list">

            {/* Card 1 — wide: Keyword extraction */}
            <article className="land-card land-card-wide" role="listitem">
              <div className="land-card-icon" aria-hidden="true">
                <IconTarget />
              </div>
              <h3 className="land-card-title">Palabras clave precisas</h3>
              <p className="land-card-body">
                Extrae los términos exactos del aviso y los integra en tu CV
                de forma natural — sin saturar, sin perder tu voz.
              </p>
              <div className="land-card-visual" aria-hidden="true">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['React', 'TypeScript', 'Node.js', 'CI/CD', 'Agile', 'SQL'].map((kw) => (
                    <span key={kw} style={{
                      fontSize: 12, fontWeight: 500,
                      color: 'var(--ld-indigo)',
                      background: 'var(--ld-indigo-soft)',
                      border: '1px solid rgba(20,33,58,0.22)',
                      padding: '4px 10px',
                      borderRadius: 999,
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* Card 2 — narrow: Speed */}
            <article className="land-card land-card-narrow" role="listitem">
              <div className="land-card-icon" aria-hidden="true">
                <IconZap />
              </div>
              <h3 className="land-card-title">Listo en segundos</h3>
              <p className="land-card-body">
                Pegás el texto y en menos de 30 segundos tenés un CV
                completamente adaptado al puesto.
              </p>
            </article>

            {/* Card 3 — narrow: Privacy */}
            <article className="land-card land-card-mid" role="listitem">
              <div className="land-card-icon" aria-hidden="true">
                <IconLock />
              </div>
              <h3 className="land-card-title">Privacidad total</h3>
              <p className="land-card-body">
                Tu CV nunca toca servidores externos.
              </p>
            </article>

            {/* Card 4 — fill: Cover letter */}
            <article className="land-card land-card-fill" role="listitem">
              <div className="land-card-icon" aria-hidden="true">
                <IconStar />
              </div>
              <h3 className="land-card-title">Carta de presentación incluida</h3>
              <p className="land-card-body">
                No solo adapta el CV — genera una carta de presentación
                personalizada que conecta tu experiencia con lo que el puesto
                pide, sin sonar a template.
              </p>
              <div className="land-card-visual" aria-hidden="true">
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ld-text-muted)' }}>
                  Hola, me interesa el puesto de Senior Developer porque...
                  mi experiencia en sistemas distribuidos se alinea con...
                </div>
              </div>
            </article>

          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          DESIRE — How it works (3-step process)
          ────────────────────────────────────────────────────────────────── */}
      <div className="land-section-full">
        <div className="land-section">
          <span className="land-section-label gsap-reveal">Cómo funciona</span>
          <h2 className="land-h2 gsap-reveal">
            Tres pasos para un CV enfocado
          </h2>

          <div className="land-process" role="list">
            <div className="land-step" role="listitem">
              <div className="land-step-num" aria-label="Paso 1">01</div>
              <h3 className="land-step-title">Subí tu CV</h3>
              <p className="land-step-body">
                Pegá el texto o subí un PDF. Cualquier formato sirve.
              </p>
            </div>

            <div className="land-step" role="listitem">
              <div className="land-step-num" aria-label="Paso 2">02</div>
              <h3 className="land-step-title">Pegá la vacante</h3>
              <p className="land-step-body">
                Copiá el aviso completo: requisitos, responsabilidades,
                descripción de la empresa.
              </p>
            </div>

            <div className="land-step" role="listitem">
              <div className="land-step-num" aria-label="Paso 3">03</div>
              <h3 className="land-step-title">Recibí tu versión</h3>
              <p className="land-step-body">
                adaptIA genera resumen, palabras clave y carta de presentación
                específicos para ese puesto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          DESIRE — GSAP Zoom Animation
          ────────────────────────────────────────────────────────────────── */}
      <AdaptiaZoomAnimation />

      {/* ────────────────────────────────────────────────────────────────────
          ACTION — Final CTA
          High-contrast, centered, massive typography.
          ────────────────────────────────────────────────────────────────── */}
      <section className="land-cta-section" aria-labelledby="cta-heading">
        <div className="land-cta-glow" aria-hidden="true" />
        <div className="land-cta-inner">
          <h2 id="cta-heading" className="land-cta-h2">
            Adaptá tu próximo CV ahora
          </h2>
          <p className="land-cta-sub">
            Sin registro. Sin tarjeta.
          </p>
          <div className="land-cta-actions">
            <button
              className="land-btn-primary"
              onClick={handleCta}
              style={{ fontSize: 16, padding: '16px 36px' }}
              aria-label="Ir al taller de adaptación"
            >
              <span className="land-btn-icon" aria-hidden="true">
                <IconArrow />
              </span>
              Ir al taller
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="land-footer">
        <span className="land-footer-logo" aria-label="adaptIA">
          adapt<span>IA</span>
        </span>

        <span className="land-footer-note">
          100% open source.
        </span>

        <nav className="land-footer-links" aria-label="Links del footer">
          <button className="land-footer-link" onClick={handleCta}>
            Ir al taller
          </button>
          <button className="land-footer-link" onClick={() =>
            document.querySelector('.land-bento')?.scrollIntoView({ behavior: 'smooth' })
          }>
            Características
          </button>
        </nav>
      </footer>
    </div>
  );
}
