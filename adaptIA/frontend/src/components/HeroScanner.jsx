import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../styles/hero-scanner.css';

gsap.registerPlugin(useGSAP);

export default function HeroScanner() {
  const container = useRef(null);

  const pills = [
    { id: 1, label: 'React', startX: '25%', startY: '35%', endX: '75%', endY: '25%' },
    { id: 2, label: 'Node.js', startX: '35%', startY: '55%', endX: '85%', endY: '45%' },
    { id: 3, label: 'TypeScript', startX: '15%', startY: '75%', endX: '65%', endY: '65%' },
    { id: 4, label: 'GraphQL', startX: '40%', startY: '85%', endX: '80%', endY: '85%' },
  ];

  useGSAP(() => {
    // We create a master timeline that loops infinitely
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // Phase 1: Scanner sweeps down the left column
    tl.to('.scanner-line', {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out',
    })
    .to('.scanner-line', {
      top: '100%',
      duration: 1.5,
      ease: 'power1.inOut',
    }, 'scan')
    
    // Phase 2: Pills light up as the scanner passes them
    // Stagger the appearance of pills to simulate them being "found" during the scan
    .to('.scanner-pill', {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: 0.2,
      ease: 'back.out(2)',
    }, 'scan+=0.3')
    
    // Fade out scanner line
    .to('.scanner-line', {
      opacity: 0,
      duration: 0.2,
    }, 'scan+=1.4')
    
    // Small pause before extraction
    .to({}, { duration: 0.2 })

    // Phase 3: Injection (Pills float to right column)
    .to('.scanner-pill', {
      left: (index) => pills[index].endX,
      top: (index) => pills[index].endY,
      duration: 1.2,
      ease: 'power3.inOut',
      stagger: 0.1,
    }, 'inject')
    
    // Right column flashes to indicate optimization
    .to('.scanner-flash', {
      opacity: 0.15,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    }, 'inject+=0.6')
    
    // Small pause to show the optimized state
    .to({}, { duration: 1.5 })

    // Phase 4: Reset
    .to('.scanner-pill', {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in',
    })
    // Reset positions immediately after fade out
    .set('.scanner-pill', {
      left: (index) => pills[index].startX,
      top: (index) => pills[index].startY,
    })
    .set('.scanner-line', { top: 0 });
    
  }, { scope: container });

  return (
    <div className="hero-scanner-wrapper" ref={container} aria-hidden="true">
      {/* Absolute layer for floating elements */}
      <div className="scanner-pills-layer">
        {pills.map((pill) => (
          <div
            key={pill.id}
            className="scanner-pill"
            style={{ left: pill.startX, top: pill.startY, scale: 0.8 }}
          >
            {pill.label}
          </div>
        ))}
      </div>

      {/* Left Column: Job Description (Vacante) */}
      <div className="scanner-col">
        <div className="scanner-col-title">Vacante</div>
        <div className="scanner-line" />
        <div className="skel-line w-80" />
        <div className="skel-line w-100" />
        <div className="skel-line w-90" />
        <div className="skel-line w-60 indent" />
        <div className="skel-line w-100" />
        <div className="skel-line w-40" />
        <div className="skel-line w-80 indent" />
        <div className="skel-line w-100" />
      </div>

      {/* Right Column: Your CV (Tu CV) */}
      <div className="scanner-col">
        <div className="scanner-flash" />
        <div className="scanner-col-title">Tu CV</div>
        <div className="skel-line w-100" />
        <div className="scanner-slot" style={{ width: '40%' }} />
        <div className="skel-line w-90" />
        <div className="skel-line w-80" />
        <div className="scanner-slot" style={{ width: '50%' }} />
        <div className="skel-line w-60" />
        <div className="scanner-slot" style={{ width: '45%' }} />
        <div className="scanner-slot" style={{ width: '35%' }} />
      </div>
    </div>
  );
}
