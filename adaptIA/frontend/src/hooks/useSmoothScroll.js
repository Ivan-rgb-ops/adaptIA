/**
 * useSmoothScroll.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook que inicializa Lenis (smooth scroll de inercia pesada) y lo
 * sincroniza con el ticker de GSAP + ScrollTrigger.
 *
 * Parámetros físicos:
 *   duration       1.6s  — inercia pesada estilo Awwwards/FWA
 *   easing         exponencial amortiguada (t => Math.min(1, 1.001 - 2^(-10t)))
 *   wheelMultiplier 0.85 — desplazamiento suave, sin saltos de pantalla
 *   touchMultiplier 1.5  — respuesta natural en táctil
 *
 * Integración GSAP:
 *   - Ticker GSAP ejecuta lenis.raf() → eliminando dobles requestAnimationFrame.
 *   - lagSmoothing(0) elimina el "catch-up" agresivo que produce tirones.
 *   - ScrollTrigger.update() se llama en cada evento scroll de Lenis.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @param {Object}  options
 * @param {number}  [options.duration=1.6]          Duración de la desaceleración en segundos.
 * @param {number}  [options.wheelMultiplier=0.85]  Multiplicador de la rueda del mouse.
 * @param {number}  [options.touchMultiplier=1.5]   Multiplicador para gestos táctiles.
 * @param {boolean} [options.smoothTouch=false]      Suavizado en dispositivos táctiles.
 * @param {boolean} [options.autoRaf=false]          Lenis no debe gestionar su propio RAF.
 * @returns {{ lenisRef: React.MutableRefObject<Lenis|null> }}
 */
export function useSmoothScroll({
  duration        = 1.6,
  wheelMultiplier = 0.85,
  touchMultiplier = 1.5,
  smoothTouch     = false,
  autoRaf         = false,   // Delegamos el RAF al ticker de GSAP
} = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // ── 1. Instanciar Lenis ─────────────────────────────────────────────────
    const lenis = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation:        'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier,
      touchMultiplier,
      smoothTouch,
      infinite:   false,
      autoRaf,             // RAF manual → controlado por gsap.ticker
    });

    lenisRef.current = lenis;

    // ── 2. Sincronizar el scroll virtual con ScrollTrigger ──────────────────
    // Cada vez que Lenis emite un evento scroll, forzamos a ScrollTrigger
    // a recalcular su posición interna (scroll virtual ≠ scroll nativo).
    lenis.on('scroll', ScrollTrigger.update);

    // ── 3. Integrar con el ticker de GSAP ───────────────────────────────────
    // Usamos gsap.ticker en lugar de requestAnimationFrame propio de Lenis
    // para que ambos sistemas compartan el mismo frame loop y no generen
    // desincronizaciones o tearing visual.
    //
    // lagSmoothing(0) desactiva el "catch-up" de GSAP que ocurre cuando la
    // pestaña pierde foco y vuelve (evita el salto de múltiples frames).
    gsap.ticker.lagSmoothing(0);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000); // GSAP ticker devuelve segundos; Lenis necesita ms
    };

    gsap.ticker.add(tickerCallback);

    // ── 4. Refresh de ScrollTrigger tras mount ───────────────────────────────
    // Necesario para que los triggers calculen alturas correctas cuando el
    // documento ya tiene contenido renderizado.
    ScrollTrigger.refresh();

    // ── 5. Cleanup estricto ─────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      // No hacemos ScrollTrigger.killAll() para no destruir animaciones de
      // componentes hijos; solo refresh para recalcular tras unmount.
      ScrollTrigger.refresh();
    };
  }, [duration, wheelMultiplier, touchMultiplier, smoothTouch, autoRaf]);

  return { lenisRef };
}
