// src/components/Preloader.jsx
// Versão simplificada - sem race conditions, timing direto GSAP

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

const Preloader = ({ onComplete }) => {
  // Gates
  const [fakeProgress, setFakeProgress] = useState(0);
  const [canvasReady, setCanvasReady]   = useState(false);
  const [fontsReady, setFontsReady]     = useState(false);

  // Refs
  const preloaderRef    = useRef(null);
  const backgroundRef   = useRef(null);
  const logoRedRef      = useRef(null);
  const logoLightRef    = useRef(null);
  const loaderBarRef    = useRef(null);
  const curtainLeftRef  = useRef(null);
  const curtainRightRef = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // ---------------------------------------
  // 1) Setup inicial
  // ---------------------------------------
  useEffect(() => {
    document.documentElement.classList.add('preloading');

    if (logoRedRef.current) {
      gsap.set(logoRedRef.current, {
        perspective: 1000,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 100%',
        backfaceVisibility: 'visible',
        opacity: 1,
        rotationX: 0,
        z: 0,
      });
    }

    gsap.set([curtainLeftRef.current, curtainRightRef.current], {
      visibility: 'hidden',
      x: 0,
    });

    return () => {
      document.documentElement.classList.remove('preloading');
    };
  }, []);

  // -----------------------------------------------------------------
  // 2) Loading animation - wipe simultâneo (barra + clip-path)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!loaderBarRef.current || !logoLightRef.current) return;

    const setWidth = gsap.quickSetter(loaderBarRef.current, 'width', '%');
    const setClip  = (v) => {
      logoLightRef.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    };

    if (prefersReduced) {
      setWidth(100);
      setClip(100);
      setFakeProgress(100);
      return;
    }

    const state = { v: 0 };
    const t = gsap.to(state, {
      v: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = Math.round(state.v);
        setWidth(p);
        setClip(p);
        setFakeProgress(p);
      },
    });

    return () => t.kill();
  }, [prefersReduced]);

  // ----------------------
  // 3) Canvas readiness - ESTRATÉGIA ÚNICA (polling + timeout)
  // ----------------------
  useEffect(() => {
    const check = () => {
      const c = document.querySelector('#root canvas');
      return c?.width > 0;
    };

    // Early return se já estiver pronto
    if (check()) {
      setCanvasReady(true);
      console.log('✅ Canvas ready (immediate)');
      return;
    }

    // Polling a cada 100ms
    const iv = setInterval(() => {
      if (check()) {
        clearInterval(iv);
        clearTimeout(to);
        setCanvasReady(true);
        console.log('✅ Canvas ready (polled)');
      }
    }, 100);

    // Fallback timeout 3s
    const to = setTimeout(() => {
      clearInterval(iv);
      setCanvasReady(true);
      console.warn('⚠️ Canvas forced by timeout');
    }, 3000);

    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, []);

  // -------------------
  // 4) Fonts readiness
  // -------------------
  useEffect(() => {
    let resolved = false;
    const done = () => { 
      if (!resolved) { 
        resolved = true; 
        setFontsReady(true);
        console.log('✅ Fonts ready');
      } 
    };

    (async () => {
      try {
        if (document.fonts?.load) {
          await document.fonts.load('900 8rem "Neue Haas Grotesk Display Pro"');
        } else if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {/* ignore */}
      finally { done(); }
    })();

    const to = setTimeout(() => {
      console.warn('⚠️ Fonts forced by timeout');
      done();
    }, 2000);

    return () => clearTimeout(to);
  }, []);

  // -----------------------
  // 5) Exit - Timing direto GSAP + sincronização real com Hero
  // -----------------------
  const animateExit = useCallback(() => {
    const el = preloaderRef.current;
    if (!el) return;

    console.log('🎬 Starting preloader exit');

    if (prefersReduced) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          el.style.display = 'none';
          document.documentElement.classList.remove('preloading');
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
          onComplete();
          console.log('✅ Preloader complete (reduced motion)');
        },
      });
      return;
    }

    // Promise que resolve quando Hero completar animação
    const waitForHeroComplete = () => new Promise((resolve) => {
      const onHeroComplete = () => {
        console.log('✅ Hero animation completed - ready for curtains');
        resolve();
      };
      window.addEventListener('hero:animation-complete', onHeroComplete, { once: true });
      
      // Fallback: se não receber evento em 3s, continua mesmo assim
      setTimeout(() => {
        console.warn('⚠️ Hero animation timeout - forcing curtains');
        resolve();
      }, 3000);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Preloader timeline complete');
      },
    });

    tl.addLabel('start')
      // Pausa elegante
      .to({}, { duration: 0.25 }, 'start')

      // ✅ PRIME: Dispara Hero IMEDIATAMENTE após pausa
      .addLabel('prime', 'start+=0.25')
      .call(() => {
        window.dispatchEvent(new CustomEvent('hero:animate-entry'));
        console.log('📡 Hero entry triggered');
      }, null, 'prime')

      // OUT logo acontece AO MESMO TEMPO que Hero anima
      .to([logoRedRef.current, logoLightRef.current], {
        opacity: 0,
        rotationX: 90,
        z: -200,
        transformOrigin: '50% 100%',
        ease: 'power2.in',
        duration: 0.55,
      }, 'prime')

      // ✅ WAIT: Aguarda Hero completar (Promise resolve)
      .call(async () => {
        await waitForHeroComplete();
      })

      // ✅ REVEAL: Split das cortinas (Hero garantidamente completo)
      .addLabel('reveal')
      
      // Prepara cortinas
      .set([curtainLeftRef.current, curtainRightRef.current], { 
        visibility: 'visible' 
      }, 'reveal')
      .set(loaderBarRef.current, { display: 'none' }, 'reveal')
      .set(backgroundRef.current, { autoAlpha: 0 }, 'reveal')

      // Abre cortinas (Hero já está pintado atrás)
      .to(curtainLeftRef.current, { 
        x: '-100%', 
        duration: 0.9, 
        ease: 'power3.inOut' 
      }, 'reveal')
      .to(curtainRightRef.current, { 
        x: '100%', 
        duration: 0.9, 
        ease: 'power3.inOut' 
      }, 'reveal')

      // ✅ CLEANUP: Remove preloader DEPOIS das cortinas abrirem
      .call(() => {
        el.style.display = 'none';
        document.documentElement.classList.remove('preloading');
        onComplete();
        console.log('✅ Preloader complete');
      });

  }, [onComplete, prefersReduced]);

  // ------------------------
  // 6) Gate para disparar saída
  // ------------------------
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    
    if (allReady) {
      console.log('🎯 All gates passed:', { fakeProgress, canvasReady, fontsReady });
      animateExit();
    }
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // --------------
  // 7) Render
  // --------------
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
      {/* Fundo neutral dark (apagado no split) */}
      <div ref={backgroundRef} className="preloader__background" />

      {/* Logo central em duas camadas (red base + light masked) */}
      <div className="preloader__center">
        <div className="preloader__logo-wrap">
          <h1 ref={logoRedRef}   className="preloader__logo">SPOONFUL</h1>
          <h1 ref={logoLightRef} className="preloader__logo preloader__logo--light">SPOONFUL</h1>
        </div>
      </div>

      {/* Loader bar (pinta de vermelho; desligada no split) */}
      <div ref={loaderBarRef} className="preloader__loader-bar" />

      {/* Cortinas (visíveis e animadas apenas no split) */}
      <div ref={curtainLeftRef}  className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />
    </div>
  );
};

Preloader.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default Preloader;