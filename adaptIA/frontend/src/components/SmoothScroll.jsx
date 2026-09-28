/**
 * SmoothScroll.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper component reutilizable que aplica smooth scroll Lenis + GSAP
 * a toda la sub-árbol de React que envuelve.
 *
 * Uso:
 *   <SmoothScroll>
 *     <App />
 *   </SmoothScroll>
 *
 * También expone la instancia de Lenis vía Context para que cualquier
 * componente hijo pueda acceder y llamar lenis.scrollTo(), lenis.stop(), etc.
 *
 * Props:
 *   duration        {number}  1.4–1.8  (default 1.6) — inercia de desaceleración
 *   wheelMultiplier {number}  (default 0.85)
 *   touchMultiplier {number}  (default 1.5)
 *   smoothTouch     {boolean} (default false)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

// ── Context ──────────────────────────────────────────────────────────────────
export const LenisContext = createContext(null);

/**
 * Hook para acceder a la instancia de Lenis desde cualquier componente hijo.
 * Ejemplo: const lenis = useLenis(); lenis?.scrollTo('#hero');
 */
export function useLenis() {
  return useContext(LenisContext);
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function SmoothScroll({
  children,
  duration        = 1.6,
  wheelMultiplier = 0.85,
  touchMultiplier = 1.5,
  smoothTouch     = false,
}) {
  const { lenisRef } = useSmoothScroll({
    duration,
    wheelMultiplier,
    touchMultiplier,
    smoothTouch,
    autoRaf: false,
  });

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}
