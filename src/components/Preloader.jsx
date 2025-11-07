// src/components/Preloader.jsx
// Preloader: tela inicial neutra + logo central + barra de carregamento suave
// Saída: texto OUT → split curtains → revela site → dispara hero:animate-entry

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

const Preloader = ({ onComplete }) => {
  // Gating lógico (acesso/ARIA)
  const [fakeProgress, setFakeProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  // Refs
  const preloaderRef = useRef(null);
  const logoRef = useRef(null);
  const loaderBarRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ----------------------------
  // 1) Setup inicial de estados
  // ----------------------------
  useEffect(() => {
    // Classes de controle para evitar FOUC
    document.documentElement.classList.add('preloading');

    // Logo pronto para 3D OUT
    if (logoRef.current) {
      gsap.set(logoRef.current, {
        perspective: 1000,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 100%',
        backfaceVisibility: 'visible',
        opacity: 1,
        rotationX: 0,
        z: 0,
      });
    }

    // Cortinas começam invisíveis (aparecem só no split)
    gsap.set([curtainLeftRef.current, curtainRightRef.current], {
      visibility: 'hidden',
      x: 0,
    });

    return () => {
      document.documentElement.classList.remove('preloading');
    };
  }, []);

  // ----------------------------------------
  // 2) Visual do loader (suave/sem jitter)
  // ----------------------------------------
  useEffect(() => {
    if (!loaderBarRef.current || prefersReduced) return;

    // Barra vermelha enchendo (apenas visual)
    gsap.fromTo(
      loaderBarRef.current,
      { width: '0%' },
      { width: '100%', duration: 2, ease: 'power2.inOut' }
    );
  }, [prefersReduced]);

  // -----------------------------------------------------
  // 3) Fake progress lógico (para gating + aria-valuenow)
  // -----------------------------------------------------
  useEffect(() => {
    if (prefersReduced) {
      setFakeProgress(100);
      return;
    }

    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => setFakeProgress(Math.round(obj.v)),
    });

    return () => tween.kill();
  }, [prefersReduced]);

  // ----------------------
  // 4) Canvas readiness
  // ----------------------
  useEffect(() => {
    const markReady = () => setCanvasReady(true);

    const handleCanvasReady = () => markReady();
    window.addEventListener('canvas:ready', handleCanvasReady, { once: true });

    const ok = () => {
      const c = document.querySelector('#root canvas');
      return c && c.width > 0;
    };

    if (ok()) {
      markReady();
    } else {
      const iv = setInterval(() => {
        if (ok()) {
          clearInterval(iv);
          clearTimeout(to);
          markReady();
        }
      }, 100);

      const to = setTimeout(() => {
        console.warn('⚠️ Canvas timeout – forçando ready');
        clearInterval(iv);
        markReady();
      }, 3000);

      return () => {
        clearInterval(iv);
        clearTimeout(to);
        window.removeEventListener('canvas:ready', handleCanvasReady);
      };
    }

    return () => window.removeEventListener('canvas:ready', handleCanvasReady);
  }, []);

  // ---------------------
  // 5) Fonts readiness
  // ---------------------
  useEffect(() => {
    let timeoutId;
    let resolved = false;

    const done = () => {
      if (!resolved) {
        resolved = true;
        setFontsReady(true);
      }
    };

    (async () => {
      try {
        if (document.fonts?.load) {
          await document.fonts.load('900 8rem "Neue Haas Grotesk Display Pro"');
        } else if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // ignore
      } finally {
        done();
      }
    })();

    timeoutId = setTimeout(() => {
      console.warn('⚠️ Fonts forçadas por timeout');
      done();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // ---------------------
  // 6) Saída / transição
  // ---------------------
  const animateExit = useCallback(() => {
    const el = preloaderRef.current;
    if (!el) return;

    if (prefersReduced) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          el.style.display = 'none';
          // dispara hero
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
          document.documentElement.classList.remove('preloading');
          onComplete();
        },
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = 'none';
        // dispara hero após split
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
        }, 80);
        document.documentElement.classList.remove('preloading');
        onComplete();
      },
    });

    tl.addLabel('start')
      // Pausa breve
      .to({}, { duration: 0.25 }, 'start')

      // Texto OUT (igual coreografia do hero-out)
      .to(
        logoRef.current,
        {
          opacity: 0,
          rotationX: 90,
          z: -200, // “para trás”
          transformOrigin: '50% 100%',
          ease: 'power2.in',
          duration: 0.55,
        },
        'start+=0.25'
      )

      // Liga cortinas e faz split
      .set(
        [curtainLeftRef.current, curtainRightRef.current],
        { visibility: 'visible' },
        'start+=0.7'
      )
      .to(
        curtainLeftRef.current,
        { x: '-100%', duration: 0.9, ease: 'power3.inOut' },
        'start+=0.75'
      )
      .to(
        curtainRightRef.current,
        { x: '100%', duration: 0.9, ease: 'power3.inOut' },
        'start+=0.75'
      );
  }, [onComplete, prefersReduced]);

  // ----------------------------
  // 7) Disparo da saída (gating)
  // ----------------------------
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) {
      // Evita “startar” hero antes do preloader terminar
      animateExit();
    }
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // ---------------
  // 8) Render
  // ---------------
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
      {/* Fundo neutro */}
      <div className="preloader__background" />

      {/* Logo central (vermelho sobre fundo neutral) */}
      <div className="preloader__center">
        <h1 ref={logoRef} className="preloader__logo">SPOONFUL</h1>
      </div>

      {/* Barra vermelha enchendo (visual) */}
      <div ref={loaderBarRef} className="preloader__loader-bar" />

      {/* Cortinas para o split (apenas na saída) */}
      <div ref={curtainLeftRef} className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />
    </div>
  );
};

Preloader.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Preloader;
