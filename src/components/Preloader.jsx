// src/components/Preloader.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import Splitting from 'splitting';
import 'splitting/dist/splitting.css';

const BRAND_TEXT = 'SPOONFUL';

const Preloader = ({ onComplete }) => {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  const preloaderRef = useRef(null);
  const logoRef = useRef(null);
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
          backfaceVisibility: 'visible', // ← IGUAL HERO!
          opacity: 1,
          rotationX: 0,
          z: 0,
        });
      });
    }

    gsap.set([curtainLeftRef.current, curtainRightRef.current], { x: 0 });

    return () => {
      if (currentLogo) {
        currentLogo.innerHTML = BRAND_TEXT;
      }
      charsRef.current = [];
    };
  }, []);

  // ==========================================
  // 2) FAKE PROGRESS
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
  // 5) ANIMATE EXIT (IGUAL HERO!)
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
      // FASE 1: Chars saem (ROTAÇÃO IGUAL HERO)
      .to(
        charsRef.current,
        {
          opacity: 0,
          rotationX: 90,       // ← IGUAL HERO
          z: 200,              // ← IGUAL HERO (positivo)
          transformOrigin: '50% 100%',
          ease: 'power2.inOut',
          stagger: { 
            each: 0.015,       // ← IGUAL HERO
            from: 'start' 
          },
          duration: 0.4,       // ← IGUAL HERO
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
        'start+=0.3'          // ← Overlap com chars
      )
      .to(
        curtainRightRef.current,
        {
          x: '100%',
          duration: 0.8,
          ease: 'power3.inOut',
        },
        'start+=0.3'          // ← Mesmo timing
      );
  }, [onComplete, prefersReduced]);

  // ==========================================
  // 6) EXIT TRIGGER
  // ==========================================
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) {
      console.log('🎬 Iniciando exit animation');
      animateExit();
    }
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // ==========================================
  // 7) RENDER (LAYOUT CORRETO)
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
      {/* CORTINA ESQUERDA (com logo) */}
      <div 
        ref={curtainLeftRef} 
        className="preloader__curtain preloader__curtain--left"
      >
        {/* Logo centralizado na cortina esquerda */}
        <h1 ref={logoRef} className="preloader__logo" data-splitting>
          {BRAND_TEXT}
        </h1>
      </div>

      {/* CORTINA DIREITA (vazia, só vermelho) */}
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