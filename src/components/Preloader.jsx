// src/components/Preloader.jsx
// REFATORADO: Loader bar + mask reveal + exit sequence
import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

const Preloader = ({ onComplete }) => {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  const preloaderRef = useRef(null);
  const logoRef = useRef(null);
  const loaderBarRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ==========================================
  // 1) INITIAL SETUP
  // ==========================================
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    // Setup do logo 3D
    gsap.set(logo, {
      perspective: 1000,
      transformStyle: 'preserve-3d',
      transformOrigin: '50% 100%',
      backfaceVisibility: 'visible',
      opacity: 1,
      rotationX: 0,
      z: 0,
    });

    // Estado inicial das curtains (escondidas)
    gsap.set(curtainLeftRef.current, { x: 0 });
    gsap.set(curtainRightRef.current, { x: 0 });

    return () => {
      if (logo) logo.innerHTML = 'SPOONFUL';
    };
  }, []);

  // ==========================================
  // 2) FAKE PROGRESS (sincronizado com loader)
  // ==========================================
  useEffect(() => {
    const obj = { v: 0 };
    let raf = 0;
    let last = -1;

    const tween = gsap.to(obj, {
      v: 100,
      duration: 2, // 2s de loading
      ease: 'power2.inOut',
      onUpdate: () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rounded = Math.round(obj.v);
          if (rounded !== last) {
            last = rounded;
            setFakeProgress(rounded);
          }
        });
      },
    });

    return () => {
      tween.kill();
      cancelAnimationFrame(raf);
    };
  }, []);

  // ==========================================
  // 3) CANVAS CHECK
  // ==========================================
  useEffect(() => {
    const markReady = () => {
      setCanvasReady(true);
      console.log('✅ Canvas pronto');
    };

    const handleCanvasReady = () => markReady();
    window.addEventListener('canvas:ready', handleCanvasReady, { once: true });

    const ok = () => {
      const c = document.querySelector('#root canvas');
      return c && c.width > 0;
    };

    if (ok()) {
      markReady();
    } else {
      const i = setInterval(() => {
        if (ok()) {
          clearInterval(i);
          clearTimeout(t);
          markReady();
        }
      }, 100);

      const t = setTimeout(() => {
        console.warn('⚠️ Canvas timeout – forçando ready');
        clearInterval(i);
        markReady();
      }, 3000);

      return () => {
        clearInterval(i);
        clearTimeout(t);
        window.removeEventListener('canvas:ready', handleCanvasReady);
      };
    }

    return () => {
      window.removeEventListener('canvas:ready', handleCanvasReady);
    };
  }, []);

  // ==========================================
  // 4) FONTS CHECK
  // ==========================================
  useEffect(() => {
    let timeoutId;
    let resolved = false;

    const done = () => {
      if (!resolved) {
        resolved = true;
        setFontsReady(true);
      }
    };

    const tryLoadCritical = async () => {
      try {
        if (document.fonts?.load) {
          await document.fonts.load('900 8rem "Neue Haas Grotesk Display Pro"');
        } else if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // ignora
      } finally {
        done();
      }
    };

    tryLoadCritical();

    timeoutId = setTimeout(() => {
      console.warn('⚠️ Fonts forçadas por timeout');
      done();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // ==========================================
  // 5) LOADING BAR ANIMATION (sync com progress)
  // ==========================================
  useEffect(() => {
  if (!loaderBarRef.current || !logoRef.current) return;

    // Loader bar cresce da esquerda → direita
    gsap.to(loaderBarRef.current, {
      width: `${fakeProgress}%`,
      duration: 0.1,
      ease: 'none'
    });

    // Clip-path do light revela conforme loader passa
    gsap.to(logoRef.current, {
      clipPath: `inset(0 ${100 - fakeProgress}% 0 0)`,
      duration: 0.1,
      ease: 'none'
    });

  }, [fakeProgress]);

  // ==========================================
  // 6) ANIMATE EXIT
  // ==========================================
  const animateExit = useCallback(() => {
    if (prefersReduced) {
      // Reduced motion: fade simples
      gsap.to(preloaderRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          if (preloaderRef.current) {
            preloaderRef.current.style.display = 'none';
          }
          onComplete();
        }
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Preloader complete!');
        
        if (preloaderRef.current) {
          preloaderRef.current.style.display = 'none';
        }
        
        // Trigger Hero animation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
        }, 100);
        
        onComplete();
      },
    });

    tl.addLabel('start')
      
      // FASE 1: Pausa dramática (300ms)
      .to({}, { duration: 0.3 })
      
      // FASE 2: Logo sai (600ms)
      .to(
        logoRef.current,
        {
          opacity: 0,
          rotationX: 90,
          z: -200, // ✅ NEGATIVO (para trás)
          transformOrigin: '50% 100%',
          ease: 'power2.inOut',
          duration: 0.6,
        },
        'start+=0.3' // após pausa
      )
      
      // FASE 3: Curtains split (1.2s)
      // Começa quando chars já saíram 70%
      .to(
        curtainLeftRef.current,
        {
          x: '-100%',
          duration: 1.2,
          ease: 'power3.out', // mais suave
        },
        'start+=0.95' // 300ms pausa + 650ms chars
      )
      .to(
        curtainRightRef.current,
        {
          x: '100%',
          duration: 1.2,
          ease: 'power3.out',
        },
        'start+=0.95' // mesmo timing
      );

    // TOTAL: 300 (pausa) + 650 (chars maioria) + 1200 (curtains) ≈ 2.15s
    // Overlap de ~450ms entre chars finais e curtains para fluidez

  }, [onComplete, prefersReduced]);

  // ==========================================
  // 7) EXIT TRIGGER
  // ==========================================
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) {
      console.log('🎬 Iniciando exit animation');
      animateExit();
    }
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // ==========================================
  // 8) RENDER
  // ==========================================
  return (
    <div
      ref={preloaderRef}
      className="preloader"
      role="progressbar"
      aria-label="Carregando"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fakeProgress}
    >
      {/* LAYER 1: Background cinza */}
      <div className="preloader__background" />

      <div className="preloader__center">
        <h1 ref={logoRef} className="preloader__logo">SPOONFUL</h1>
      </div>

      {/* LAYER 4: Loader bar */}
      <div ref={loaderBarRef} className="preloader__loader-bar" />

      <div ref={curtainLeftRef} className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />
    </div>
  );
};

Preloader.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Preloader;