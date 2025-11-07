// src/components/Preloader.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import Splitting from 'splitting';
import 'splitting/dist/splitting.css';

const BRAND_TEXT = 'SPOONFUL';

const Preloader = ({ onComplete }) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  const preloaderRef = useRef(null);
  const logoRef = useRef(null);
  const loaderBarRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const charsRef = useRef([]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ==========================================
  // 1) SPLITTING SETUP
  // ==========================================
  useEffect(() => {
    const currentLogo = logoRef.current;
    if (!currentLogo) return;

    const results = Splitting({
      target: currentLogo,
      by: 'chars',
    });

    if (results[0]) {
      charsRef.current = results[0].chars;

      charsRef.current.forEach((char) => {
        gsap.set(char.parentNode, {
          perspective: 1000,
          transformStyle: 'preserve-3d',
        });
        gsap.set(char, {
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'visible',
          opacity: 1,
          rotationX: 0,
          z: 0,
        });
      });
    }

    return () => {
      if (currentLogo) {
        currentLogo.innerHTML = BRAND_TEXT;
      }
      charsRef.current = [];
    };
  }, []);

  // ==========================================
  // 2) FAKE PROGRESS (0-100%)
  // ==========================================
  useEffect(() => {
    const obj = { v: 0 };
    let raf = 0;
    let last = -1;

    const tween = gsap.to(obj, {
      v: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rounded = Math.round(obj.v);
          if (rounded !== last) {
            last = rounded;
            setLoadProgress(rounded);
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
          await document.fonts.load('900 1rem "Neue Haas Grotesk Display Pro"');
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
  // 5) BACKGROUND FLIP (quando 100%)
  // ==========================================
  useEffect(() => {
    if (loadProgress === 100 && preloaderRef.current) {
      // FLIP: Cinza → Vermelho
      gsap.to(preloaderRef.current, {
        backgroundColor: 'var(--primary-red)',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    }
  }, [loadProgress]);

  // ==========================================
  // 6) ANIMATE EXIT
  // ==========================================
  const animateExit = useCallback(() => {
    if (prefersReduced) {
      if (preloaderRef.current) {
        preloaderRef.current.style.display = 'none';
      }
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Preloader complete!');
        
        if (preloaderRef.current) {
          preloaderRef.current.style.display = 'none';
        }
        
        onComplete();
      },
    });

    tl.addLabel('start')
      // FASE 1: Chars saem (IGUAL HERO)
      .to(
        charsRef.current,
        {
          opacity: 0,
          rotationX: 90,
          z: 200,
          transformOrigin: '50% 100%',
          ease: 'power2.inOut',
          stagger: { 
            each: 0.015,
            from: 'start' 
          },
          duration: 0.4,
        },
        'start'
      )
      // FASE 2: Cortinas se separam
      .to(
        curtainLeftRef.current,
        {
          x: '-100%',
          duration: 0.8,
          ease: 'power3.inOut',
        },
        'start+=0.3'
      )
      .to(
        curtainRightRef.current,
        {
          x: '100%',
          duration: 0.8,
          ease: 'power3.inOut',
        },
        'start+=0.3'
      );
  }, [onComplete, prefersReduced]);

  // ==========================================
  // 7) EXIT TRIGGER
  // ==========================================
  useEffect(() => {
    const allReady = loadProgress >= 100 && canvasReady && fontsReady;
    if (allReady) {
      console.log('🎬 Iniciando exit animation');
      // Small delay para garantir que flip visual completou
      const timeoutId = setTimeout(() => {
        animateExit();
      }, 400);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loadProgress, canvasReady, fontsReady, animateExit]);

  // ==========================================
  // 8) RENDER
  // ==========================================
  return (
    <div
      ref={preloaderRef}
      className="preloader"
      style={{
        backgroundColor: 'var(--neutral-normal)' // Inicial: cinza
      }}
    >
      {/* Loader Bar (vermelho, left → right) */}
      <div 
        ref={loaderBarRef}
        className="preloader__loader"
        style={{ width: `${loadProgress}%` }}
      />

      {/* Logo (muda de vermelho → branco conforme loader passa) */}
      <h1
        ref={logoRef}
        className="preloader__logo"
        style={{
          '--loader-progress': `${loadProgress}%`
        }}
        data-text={BRAND_TEXT}
        data-splitting
      >
        {BRAND_TEXT}
      </h1>

      {/* Cortinas (sempre presentes, apenas x=0 inicial) */}
      <div 
        ref={curtainLeftRef} 
        className="preloader__curtain preloader__curtain--left"
      />
      <div 
        ref={curtainRightRef} 
        className="preloader__curtain preloader__curtain--right"
      />
    </div>
  );
};

Preloader.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Preloader;