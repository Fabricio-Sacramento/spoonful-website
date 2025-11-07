// src/components/Preloader.jsx
// Preloader: neutral bg + SPOONFUL central (red) + barra suave
// Saída: texto OUT → split curtains → remove overlay → dispara hero:animate-entry

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

  // 1) Setup inicial (z-order e estados)
  useEffect(() => {
    document.documentElement.classList.add('preloading'); // evita flash do conteúdo

    // Logo pronto para OUT 3D
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

    // Cortinas invisíveis até o split
    gsap.set([curtainLeftRef.current, curtainRightRef.current], {
      visibility: 'hidden',
      x: 0,
    });

    return () => {
      document.documentElement.classList.remove('preloading');
    };
  }, []);

  // 2) Barra suave (visual)
  useEffect(() => {
    if (!loaderBarRef.current || prefersReduced) return;
    gsap.fromTo(
      loaderBarRef.current,
      { width: '0%' },
      { width: '100%', duration: 2, ease: 'power2.inOut' }
    );
  }, [prefersReduced]);

  // 3) Fake progress lógico (para gating/ARIA)
  useEffect(() => {
    if (prefersReduced) {
      setFakeProgress(100);
      return;
    }
    const obj = { v: 0 };
    const t = gsap.to(obj, {
      v: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => setFakeProgress(Math.round(obj.v)),
    });
    return () => t.kill();
  }, [prefersReduced]);

  // 4) Canvas ready
  useEffect(() => {
    const markReady = () => setCanvasReady(true);
    const ok = () => {
      const c = document.querySelector('#root canvas');
      return c && c.width > 0;
    };

    const onEvt = () => markReady();
    window.addEventListener('canvas:ready', onEvt, { once: true });

    if (ok()) markReady();
    else {
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
        window.removeEventListener('canvas:ready', onEvt);
      };
    }

    return () => window.removeEventListener('canvas:ready', onEvt);
  }, []);

  // 5) Fonts ready (gate anti-FOIT)
  useEffect(() => {
    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; setFontsReady(true); } };

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

    const to = setTimeout(() => { console.warn('⚠️ Fonts forçadas por timeout'); done(); }, 2000);
    return () => clearTimeout(to);
  }, []);

  // 6) Saída coreografada
  const animateExit = useCallback(() => {
    const el = preloaderRef.current;
    if (!el) return;

    if (prefersReduced) {
      gsap.to(el, {
        opacity: 0, duration: 0.3, ease: 'power2.out',
        onComplete: () => {
          el.style.display = 'none';
          document.documentElement.classList.remove('preloading');
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
          onComplete();
        }
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = 'none';
        document.documentElement.classList.remove('preloading');
        setTimeout(() => window.dispatchEvent(new CustomEvent('hero:animate-entry')), 80);
        onComplete();
      },
    });

    tl.addLabel('start')
      // mini pausa
      .to({}, { duration: 0.25 }, 'start')
      // texto OUT (mesma “sensação” do hero-out)
      .to(logoRef.current, {
        opacity: 0,
        rotationX: 90,
        z: -200,
        transformOrigin: '50% 100%',
        ease: 'power2.in',
        duration: 0.55,
      }, 'start+=0.25')
      // split
      .set([curtainLeftRef.current, curtainRightRef.current], { visibility: 'visible' }, 'start+=0.7')
      .to(curtainLeftRef.current,  { x: '-100%', duration: 0.9, ease: 'power3.inOut' }, 'start+=0.75')
      .to(curtainRightRef.current, { x: '100%',  duration: 0.9, ease: 'power3.inOut' }, 'start+=0.75');
  }, [onComplete, prefersReduced]);

  // 7) Gate da saída
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) animateExit();
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // 8) Render
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
      <div className="preloader__background" />
      <div className="preloader__center">
        <h1 ref={logoRef} className="preloader__logo">SPOONFUL</h1>
      </div>
      <div ref={loaderBarRef} className="preloader__loader-bar" />
      <div ref={curtainLeftRef} className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />
    </div>
  );
};

Preloader.propTypes = { onComplete: PropTypes.func.isRequired };
export default Preloader;
