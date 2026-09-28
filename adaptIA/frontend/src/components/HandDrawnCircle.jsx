import { useEffect, useRef, useState } from 'react';

export function HandDrawnCircle({ children, className = '' }) {
  const elementRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [metrics, setMetrics] = useState('');

  useEffect(() => {
    const update = () => {
      const el = elementRef.current;
      if (!el) return;
      const text = el.querySelector('.qh2__text');
      const svg = el.querySelector('svg');
      if (text && svg) {
        const tr = text.getBoundingClientRect();
        const sr = svg.getBoundingClientRect();
        setMetrics(`Text:${Math.round(tr.width)}x${Math.round(tr.height)}|SVG:${Math.round(sr.width)}x${Math.round(sr.height)}|LeftClr:${Math.round(tr.left-sr.left)}|RightClr:${Math.round(sr.right-tr.right)}`);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={elementRef}
      data-metrics={metrics}
      className={`qh2__pct hand-drawn-circle ${hasDrawn ? 'qh2--in hand-drawn-circle--drawn' : ''} ${className}`.trim()}
    >
      <span className="qh2__text hand-drawn-circle__text">{children}</span>
      <svg
        className="qh2__circle hand-drawn-circle__stroke"
        viewBox="0 0 220 60"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 18 32 C 22 18 55 10 110 10 C 165 10 200 18 204 32 C 208 46 175 52 110 52 C 45 52 12 46 18 32 Z"
          pathLength="100"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

export default HandDrawnCircle;
