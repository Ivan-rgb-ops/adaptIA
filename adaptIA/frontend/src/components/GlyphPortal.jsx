/**
 * Glyph Portal © 2026 Christian Katzmann. MIT.
 * Origin: UsefulPortal.astro on https://ktzm.dk → UsefulPortal.tsx → ClarityPortal.tsx.
 * A scroll-driven camera through live type. Keep this notice with copies.
 * Enhanced with GSAP ScrollTrigger for seamless full-page scrolling and pinning.
 */
import { useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a, b, n) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const DEFAULT_FONT = '"Arial Black", "Arial", sans-serif';

/** Largest opaque square, in linear time. Unlike a stem guess, it works in O, S and Ø. */
function interior(context, char, font) {
  const canvas = context.canvas;
  context.font = font;
  const m = context.measureText(char);
  const pad = 8;
  const left = Math.ceil(m.actualBoundingBoxLeft);
  const ascent = Math.ceil(m.actualBoundingBoxAscent);
  canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
  canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
  context.font = font;
  context.fontKerning = "none";
  context.fillText(char, pad + left, pad + ascent);
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  const rows = new Uint16Array(width + 1);
  let size = 0, bx = 0, by = 0;
  for (let y = 0; y < height; y++) {
    let diagonal = 0;
    for (let x = 0; x < width; x++) {
      const above = rows[x + 1];
      rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245
        ? Math.min(above, rows[x], diagonal) + 1 : 0;
      diagonal = above;
      if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
    }
  }
  if (size < 3) return null;
  return {
    x: (bx + 1 - size / 2 - pad - left) / 3,
    y: (by + 1 - size / 2 - pad - ascent) / 3,
    radius: (size / 2 - 1) / 3,
  };
}

export default function GlyphPortal({
  word = "SUBLIME",
  focusChar,
  interactive = true,
  background,
  front,
  children,
  scrollLength = 2.4,
  fontFamily = DEFAULT_FONT,
  fontWeight = 900,
  annotations = false,
  enterLabel = "Conocé más",
  showCaption = false,
  className = "",
  style,
  onProgress,
}) {
  const uid = `gp-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const clipId = `${uid}-clip`;
  const sectionRef = useRef(null);
  const progressRef = useRef(onProgress);
  useLayoutEffect(() => { progressRef.current = onProgress; }, [onProgress]);

  const text = (word.trim().normalize("NFC")) || "SUBLIME";
  let characterOffset = 0;
  const characters = Array.from(text, (char) => {
    const index = characterOffset;
    characterOffset += char.length;
    return { char, index };
  });
  const length = Number.isFinite(scrollLength) ? clamp(scrollLength, 1, 8) : 2.4;
  const weight = Number.isFinite(fontWeight) ? clamp(fontWeight, 1, 1000) : 900;
  const hasFront = front != null;
  const q = `:where(#${uid})`;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const pin = section.querySelector("[data-gp-pin]");
    const field = section.querySelector("[data-gp-field]");
    const art = section.querySelector("[data-gp-art]");
    const clip = section.querySelector(`#${clipId}`);
    const glyph = section.querySelector("[data-gp-glyph]");
    const marks = section.querySelector("[data-gp-marks]");
    const choices = section.querySelector("[data-gp-choices]");
    const buttons = Array.from(choices.querySelectorAll("button"));
    const picker = section.querySelector("[data-gp-select]");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    let disposed = false, ready = false;
    let W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
    let center = { x: 0, y: 0 }, target = null;
    let lastProgress = -1;
    let candidates = [], letters = [];
    let choosing = false;
    let bounds = { x: 0, y: 0, width: 1, height: 1 };
    let fontDirty = true;
    let currentScrollProgress = 0;

    glyph.style.fontFamily = fontFamily;

    const readInk = () => {
      if (!context) return false;
      const font = getComputedStyle(glyph);
      const scanFont = `${font.fontWeight || weight} 300px ${font.fontFamily || DEFAULT_FONT}`;
      context.font = `${font.fontWeight || weight} 100px ${font.fontFamily || DEFAULT_FONT}`;
      context.fontKerning = "none";
      const metrics = context.measureText(text);
      const advances = Array.from({ length: text.length }, (_, i) => context.measureText(text.slice(0, i)).width);
      bounds = {
        x: -metrics.actualBoundingBoxLeft,
        y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      };
      if (!bounds.width || !bounds.height) return false;
      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      const requested = focusChar ? text.indexOf(focusChar.normalize("NFC")) : -1;
      let offset = 0;
      candidates = []; letters = [];
      for (const char of Array.from(text)) {
        context.font = `${font.fontWeight || weight} 100px ${font.fontFamily || DEFAULT_FONT}`;
        const m = context.measureText(char);
        letters.push({
          index: offset,
          x: advances[offset] - m.actualBoundingBoxLeft,
          y: -m.actualBoundingBoxAscent,
          width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
          height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        });
        const found = interior(context, char, scanFont);
        if (found) candidates.push({ ...found, x: found.x + advances[offset], index: offset });
        offset += char.length;
      }
      target = candidates.find((c) => c.index === requested)
        ?? [...candidates].sort((a, b) => b.radius - a.radius || Math.abs(a.x - center.x) - Math.abs(b.x - center.x))[0]
        ?? null;
      return true;
    };

    const select = (next) => {
      target = next;
      endScale = target ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35)) : startScale;
      section.dataset.gpFocus = target ? Array.from(text.slice(target.index))[0] : "";
      section.dataset.gpFocusIndex = String(target?.index ?? -1);
      for (const button of buttons) {
        const selected = Number(button.dataset.gpLetter) === target?.index;
        button.disabled = !candidates.some((c) => c.index === Number(button.dataset.gpLetter));
        button.setAttribute("aria-checked", String(selected));
        button.tabIndex = selected ? 0 : -1;
      }
      if (picker && picker.value !== "") picker.value = String(target?.index ?? -1);
      if (picker) {
        for (const option of Array.from(picker.options)) {
          option.disabled = option.value === "" || !candidates.some((c) => c.index === Number(option.value));
        }
      }
      const u = 1 / startScale;
      const y = bounds.y + bounds.height + 25 * u;
      const x = bounds.x;
      const right = x + bounds.width;
      const cross = target ? `M${target.x - 9 * u} ${target.y}h${18 * u}M${target.x} ${target.y - 9 * u}v${18 * u}` : "";
      const annotationPath = marks.querySelector("path");
      if (annotationPath) {
        annotationPath.setAttribute("d", `M${x} ${y}H${right}M${x} ${y - 5 * u}v${10 * u}M${right} ${y - 5 * u}v${10 * u}${cross}`);
        annotationPath.setAttribute("stroke-width", String(u));
      }
    };

    const paint = (progress) => {
      const isStatic = motion.matches || !target;
      const p = isStatic ? 0 : progress;
      const t = clamp(p / 0.78);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
      const blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
      const cx = center.x + ((target?.x ?? center.x) - center.x) * blend;
      const cy = center.y + ((target?.y ?? center.y) - center.y) * blend;
      const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      const transform = `translate(${W / 2} ${H * 0.46 + H * 0.04 * eased}) scale(${scale}) rotate(${roll}) translate(${-cx} ${-cy})`;
      const radians = roll * Math.PI / 180;
      const dx = W / 2 / scale, dy = (H * .46 + H * .04 * eased) / scale;

      clip.setAttribute("transform", `scale(${scale}) rotate(${roll})`);
      glyph.setAttribute("transform", `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${-Math.sin(radians) * dx + Math.cos(radians) * dy - cy})`);
      marks.setAttribute("transform", transform);
      marks.style.opacity = String(1 - smooth(0.015, 0.17, p));

      choosing = interactive && !isStatic && p < 0.04;
      choices.inert = !choosing;
      section.dataset.gpChoosing = String(choosing);

      field.style.clipPath = t >= 1 ? "none" : `url(#${clipId})`;
      section.style.setProperty("--gp-caption", String(1 - smooth(0.01, 0.16, p)));
      section.style.setProperty("--gp-reveal", String(isStatic ? 1 : smooth(0.78, 0.92, p)));
      section.style.setProperty("--gp-field-scale", String(1 + 0.16 * smooth(0, 0.82, p)));
      section.style.setProperty("--gp-caption-hit", p < 0.08 ? "auto" : "none");
      section.dataset.gpEntered = String(p >= 0.88);
      section.dataset.gpProgress = p.toFixed(5);

      if (p !== lastProgress) {
        lastProgress = p;
        progressRef.current?.(p);
      }
    };

    const layout = () => {
      if (!section.clientWidth) return;
      W = pin.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight;
      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
      section.style.setProperty("--gp-height", `${H}px`);
      travel = H * length;
      art.setAttribute("viewBox", `0 0 ${W} ${H}`);

      if (fontDirty) {
        ready = readInk();
        fontDirty = false;
      }
      if (!ready) return;

      const wordHeight = hasFront && H < 480 ? Math.min(H * 0.38, Math.max(24, H - 264)) : H * 0.38;
      startScale = Math.min(W * 0.84 / bounds.width, wordHeight / bounds.height);
      select(target);

      for (const button of buttons) {
        const letter = letters.find((item) => item.index === Number(button.dataset.gpLetter));
        if (!letter) continue;
        Object.assign(button.style, {
          left: `${W / 2 + (letter.x - center.x) * startScale}px`,
          top: `${H * 0.46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2}px`,
          width: `${Math.max(1, letter.width * startScale)}px`,
          height: `${Math.max(44, letter.height * startScale)}px`,
        });
      }
      section.style.setProperty("--gp-word-top", `${H * 0.46 - bounds.height * startScale / 2}px`);
      section.style.setProperty("--gp-word-bottom", `${H * 0.46 + bounds.height * startScale / 2}px`);
      section.dataset.gpReady = "true";
      section.dataset.gpMotion = !motion.matches && target ? "on" : "off";
    };

    layout();
    paint(0);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) {
          fontDirty = true;
          layout();
          paint(currentScrollProgress);
          ScrollTrigger.refresh();
        }
      });
    }

    /* ── GSAP ScrollTrigger Integration ─────────────────────────────────────
       Pin the camera stage and scrub progress through the word
       ────────────────────────────────────────────────────────────────────── */
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${travel}`,
      pin: pin,
      pinSpacing: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        currentScrollProgress = self.progress;
        paint(self.progress);
      },
    });

    const choose = (event) => {
      if (currentScrollProgress >= 0.04) return;
      const button = event.target.closest("[data-gp-letter]");
      const next = candidates.find((c) => c.index === Number(button?.dataset.gpLetter));
      if (!next || next === target) return;
      select(next);
      paint(currentScrollProgress);
    };

    const navigate = (event) => {
      if (currentScrollProgress >= 0.04 || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = candidates.indexOf(target);
      const index = event.key === "Home" ? 0 : event.key === "End" ? candidates.length - 1
        : (current + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + candidates.length) % candidates.length;
      buttons.find((b) => Number(b.dataset.gpLetter) === candidates[index]?.index)?.focus({ preventScroll: true });
    };

    const pick = () => {
      if (currentScrollProgress >= 0.04) return;
      const next = candidates.find((c) => c.index === Number(picker?.value));
      if (next) {
        select(next);
        paint(currentScrollProgress);
      }
    };

    choices.addEventListener("pointerover", choose);
    choices.addEventListener("click", choose);
    choices.addEventListener("focusin", choose);
    choices.addEventListener("keydown", navigate);
    if (picker) picker.addEventListener("change", pick);

    const onResize = () => {
      fontDirty = true;
      layout();
      paint(currentScrollProgress);
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      st.kill();
      window.removeEventListener("resize", onResize);
      choices.removeEventListener("pointerover", choose);
      choices.removeEventListener("click", choose);
      choices.removeEventListener("focusin", choose);
      choices.removeEventListener("keydown", navigate);
      if (picker) picker.removeEventListener("change", pick);
    };
  }, [text, focusChar, interactive, fontFamily, weight, length, clipId, hasFront]);

  return (
    <section
      ref={sectionRef}
      id={uid}
      className={`gp-section ${className}`.trim()}
      aria-label={text}
      style={{
        "--gp-length": length,
        "--gp-characters": Array.from(text).length,
        ...style,
      }}
    >
      <style>{`
        ${q} {
          --gp-paper: #fff;
          --gp-ink: #0c1212;
          --gp-field: #0b3b2a;
          --gp-foreground: #fbfbfa;
          position: relative;
          isolation: isolate;
          background: var(--gp-paper);
          color: var(--gp-ink);
          font-family: Arial, sans-serif;
          width: 100%;
        }
        ${q} [data-gp-pin] {
          position: relative;
          width: 100%;
          height: var(--gp-height, 100svh);
          overflow: clip;
          isolation: isolate;
          background: var(--gp-paper);
        }
        ${q} [data-gp-field] {
          position: absolute;
          inset: 0;
          background: var(--gp-field);
          opacity: 0;
          pointer-events: none;
        }
        ${q}[data-gp-ready] [data-gp-field] {
          opacity: 1;
        }
        ${q} [data-gp-art] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        ${q} [data-gp-marks] {
          fill: none;
          stroke: var(--gp-ink);
          opacity: 0.6;
        }
        ${q} [data-gp-choices] {
          position: absolute;
          inset: 0;
          visibility: hidden;
          pointer-events: none;
          z-index: 10;
        }
        ${q}[data-gp-choosing=true] [data-gp-choices] {
          visibility: visible;
        }
        ${q} [data-gp-letter] {
          box-sizing: border-box;
          position: absolute;
          border: 0;
          padding: 0;
          margin: 0;
          background: transparent;
          cursor: pointer;
          pointer-events: auto;
          touch-action: pan-y;
        }
        ${q} [data-gp-letter]:disabled {
          pointer-events: none;
        }
        ${q} [data-gp-letter]:focus-visible {
          outline: 2px solid var(--gp-field);
          outline-offset: 5px;
        }
        ${q} [data-gp-fallback] {
          position: absolute;
          inset: 0;
          display: none;
          place-items: center;
          font-size: min(calc(100cqw / var(--gp-characters)), 38cqh);
          line-height: 1;
          color: var(--gp-field);
        }
        ${q}[data-gp-ready] [data-gp-fallback] {
          visibility: hidden;
        }
        ${q} [data-gp-caption] {
          position: absolute;
          inset: auto 8% 8%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font: 12px/1.4 Arial, sans-serif;
          opacity: var(--gp-caption, 1);
          pointer-events: var(--gp-caption-hit, auto);
          z-index: 11;
        }
        ${q} [data-gp-front] {
          position: absolute;
          inset: 0;
          opacity: var(--gp-caption, 1);
          pointer-events: none;
          z-index: 10;
        }
        ${q} [data-gp-front] a,
        ${q} [data-gp-front] button {
          pointer-events: var(--gp-caption-hit, auto);
        }
        ${q} [data-gp-hint] {
          max-width: 30ch;
          color: var(--gp-ink);
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        ${q} [data-gp-enter] {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          color: inherit;
          font-size: 13px;
          text-decoration: none;
          letter-spacing: 0.04em;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        ${q} [data-gp-enter]:hover {
          opacity: 1;
        }
        ${q} [data-gp-content] {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          padding: clamp(32px, 7%, 100px);
          display: grid;
          align-content: center;
          color: var(--gp-foreground);
          opacity: var(--gp-reveal, 0);
          pointer-events: none;
          z-index: 15;
          overflow-wrap: anywhere;
        }
        ${q}[data-gp-entered=true] [data-gp-content] {
          pointer-events: auto;
        }
        @media(prefers-reduced-motion: reduce) {
          ${q} [data-gp-content] {
            opacity: 1 !important;
          }
          ${q} [data-gp-hint] {
            display: none;
          }
        }
      `}</style>
      <div data-gp-pin>
        <div data-gp-field aria-hidden="true" inert="">
          {background ?? (
            <div
              data-gp-default-field
              style={{
                position: "absolute",
                inset: 0,
                transform: "scale(var(--gp-field-scale,1))",
                background: "radial-gradient(circle at 18% 8%, rgba(68,125,98,.72), transparent 34%), radial-gradient(circle at 82% 20%, rgba(251,251,250,.12), transparent 28%), radial-gradient(circle at 48% 78%, rgba(9,48,35,.5), transparent 44%), linear-gradient(135deg,#0b3b2a 0%,#14573f 48%,#082d22 100%)",
              }}
            />
          )}
        </div>
        <svg data-gp-art aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                data-gp-glyph
                x="0"
                y="0"
                style={{
                  fontFamily,
                  fontWeight: weight,
                  fontSize: 100,
                  fontKerning: "none",
                  fontVariantLigatures: "none",
                  letterSpacing: 0,
                }}
              >
                {text}
              </text>
            </clipPath>
          </defs>
          <g data-gp-marks style={{ visibility: annotations ? "visible" : "hidden" }}><path /></g>
        </svg>
        <div data-gp-choices role="radiogroup" aria-label="Choose the letter to enter through" inert="">
          {characters.map(({ char, index }, i) => (
            <button
              type="button"
              role="radio"
              aria-checked="false"
              tabIndex={-1}
              data-gp-letter={index}
              key={index}
              aria-label={`${char}, letter ${i + 1} of ${characters.length}`}
            />
          ))}
        </div>
        {front && <div data-gp-front>{front}</div>}
        <span data-gp-fallback aria-hidden="true" style={{ fontFamily, fontWeight: weight }}>{text}</span>
        {showCaption && (
          <div data-gp-caption>
            <span data-gp-hint aria-hidden="true">
              {interactive ? "Scrolleá para entrar" : annotations ? "Un pasaje a través del texto" : ""}
            </span>
            {enterLabel && (
              <a data-gp-enter href={`#${uid}-content`}>
                {enterLabel} <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>
        )}
        {children && (
          <div data-gp-content id={`${uid}-content`} tabIndex={-1}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
