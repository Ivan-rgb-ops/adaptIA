import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * HandWrittenTitle
 * Animates an SVG path around the title using GSAP strokeDashoffset technique,
 * creating a "hand-drawn circle" effect. No Framer Motion dependency.
 *
 * @param {string} title - Main heading text
 * @param {string} subtitle - Optional subtitle below the heading
 */
export function HandWrittenTitle({
  title = "Kokonut UI",
  subtitle = "Optional subtitle",
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useGSAP(
    () => {
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();

        // Set initial state: hidden stroke
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          opacity: 0,
        });

        // Animate the stroke drawing
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          opacity: 0.9,
          duration: 2.5,
          ease: "power3.inOut",
        });
      }

      // Animate title entrance
      gsap.from(titleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out",
      });

      // Animate subtitle entrance
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          duration: 0.8,
          delay: 1,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", maxWidth: "36rem" }}
    >
      {/* SVG hand-drawn oval — sits behind the text */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 600"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <title>Circle Animation</title>
        <path
          ref={pathRef}
          d="M 950 90 
             C 1250 300, 1050 480, 600 520
             C 250 520, 150 480, 150 300
             C 150 120, 350 80, 600 80
             C 850 80, 950 180, 950 180"
          fill="none"
          strokeWidth="12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "inherit" }}
        />
      </svg>

      {/* Text content — sized to match SVG aspect ratio so oval wraps it */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "20%",
          paddingBottom: "20%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1
          ref={titleRef}
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "inherit",
            margin: 0,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            ref={subtitleRef}
            style={{
              fontSize: "1.1rem",
              marginTop: "0.5rem",
              opacity: 0.75,
              color: "inherit",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
