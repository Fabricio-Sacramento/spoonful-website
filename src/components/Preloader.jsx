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

  const logoRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const charsRef = useRef([]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ==========================================
  // 1) SPLITTING SETUP + estado inicial GSAP
  // ==========================================
  useEffect(() => {
    const currentLogo = logoRef.current; // ← captura ref estável
    if (!currentLogo) return;

    const results = Splitting({
      target: currentLogo,
      by: 'chars',
    });

    if (results[0]) {
      charsRef.current = results[0].chars;

      // Setup 3D transform e estado inicial
      charsRef.current.forEach((char) => {
        gsap.set(char.parentNode, {
          perspective: 1000,
          transformStyle: 'preserve-3d',
        });
        gsap.set(char, {
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden', // evita artefatos ao rotacionar
          opacity: 1,
          rotationX: 0,
          z: 0,
        });
      });
    }

    // Estado inicial das cortinas
    gsap.set([curtainLeftRef.current, curtainRightRef.current], { x: 0 });

    // Cleanup do Splitting (remove spans) usando a ref capturada
    return () => {
      if (currentLogo) {
        currentLogo.innerHTML = BRAND_TEXT;
      }
      charsRef.current = [];
    };
  }, []);

  // ==========================================
  // 2) FAKE PROGRESS (throttle via rAF)
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
  // 3) CANVAS CHECK (evento + fallback)
  // ==========================================
  useEffect(() => {
    const markReady = () => {
      setCanvasReady(true);
      console.log('✅ Canvas pronto');
    };

    const handleCanvasReady = () => markReady();
    window.addEventListener('canvas:ready', handleCanvasReady, { once: true });

    // Fallback rápido: checa DOM
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
  // 4) FONTS CHECK (aguarda fontes críticas)
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

    // Se suportado, aguarde apenas a fonte crítica
    const tryLoadCritical = async () => {
      try {
        if (document.fonts?.load) {
          // Ajuste o weight/style conforme a sua família/font-face
          await document.fonts.load('700 1rem "Neue Haas Grotesk Display Pro"');
        } else if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // ignora erros e cai no done()
      } finally {
        done();
      }
    };

    tryLoadCritical();

    // Timeout safety único
    timeoutId = setTimeout(() => {
      console.warn('⚠️ Fonts forçadas por timeout');
      done();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // ==========================================
  // 5) ANIMATE EXIT (respeita reduced motion)
  // ==========================================
  const animateExit = useCallback(() => {
    if (prefersReduced) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Preloader complete!');
        onComplete();
      },
    });

    tl.addLabel('start')
      // FASE 1: Chars saem
      .to(
        charsRef.current,
        {
          opacity: 0,
          rotationX: 90,
          z: 200,
          transformOrigin: '50% 100%',
          ease: 'power2.inOut',
          stagger: { each: 0.025, from: 'start' },
          duration: 0.6,
        },
        'start'
      )
      // FASE 2: Cortinas abrem (overlap)
      .to(
        curtainLeftRef.current,
        {
          x: '-100%',
          duration: 1,
          ease: 'power3.inOut',
        },
        'start+=0.3'
      )
      .to(
        curtainRightRef.current,
        {
          x: '100%',
          duration: 1,
          ease: 'power3.inOut',
        },
        'start+=0.3'
      );
  }, [onComplete, prefersReduced]);

  // ==========================================
  // 6) EXIT TRIGGER (quando tudo pronto)
  // ==========================================
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) {
      console.log('🎬 Iniciando exit animation');
      animateExit();
    }
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // ==========================================
  // 7) RENDER
  // ==========================================
  return (
    <div
      className="preloader"
      role="progressbar"
      aria-label="Carregando"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={fakeProgress}
      // garante bloqueio de interação
      style={{ pointerEvents: 'auto' }}
    >
      {/* Loader bar */}
      <div className="preloader__fill" style={{ width: `${fakeProgress}%` }} />

      {/* Curtains */}
      <div ref={curtainLeftRef} className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />

      {/* Logo com split text */}
      <h1
        ref={logoRef}
        className="preloader__logo"
        style={{ '--fill': `${fakeProgress}%` }}
        data-splitting
      >
        {BRAND_TEXT}
      </h1>
    </div>
  );
};

Preloader.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Preloader;
