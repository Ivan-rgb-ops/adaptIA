import { createContext, useContext, useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { lenisRef } = useSmoothScroll({
    duration,
    wheelMultiplier,
    touchMultiplier,
    smoothTouch,
    autoRaf: false,
  });

  // Si es un celular, devolvemos los elementos directamente sin envolverlos en Lenis
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}