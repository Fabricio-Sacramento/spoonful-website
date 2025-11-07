// src/components/Preloader.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';

const Preloader = ({ onComplete }) => {
  const [fakeProgress, setFakeProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  const preloaderRef     = useRef(null);
  const logoRedRef       = useRef(null);
  const logoLightRef     = useRef(null);
  const loaderBarRef     = useRef(null);
  const curtainLeftRef   = useRef(null);
  const curtainRightRef  = useRef(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // 1) Setup inicial
  useEffect(() => {
    document.documentElement.classList.add('preloading');

    // Estado inicial do logo (para OUT 3D depois)
    const logoForOut = logoRedRef.current; // usamos a base para o OUT
    if (logoForOut) {
      gsap.set(logoForOut, {
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
    gsap.fromTo(loaderBarRef.current,
      { width: '0%' },
      { width: '100%', duration: 2, ease: 'power2.inOut' }
    );
  }, [prefersReduced]);

  // 3) Reveal do logo LIGHT (clip-path sincronizado)
  useEffect(() => {
    if (prefersReduced || !logoLightRef.current) return;

    // Sincroniza com a barra (mesma duração)
    gsap.fromTo(logoLightRef.current,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 2, ease: 'power2.inOut' }
    );
  }, [prefersReduced]);

  // 4) Fake progress lógico (gate)
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

  // 5) Canvas ready
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
        if (ok()) { clearInterval(iv); clearTimeout(to); markReady(); }
      }, 100);
      const to = setTimeout(() => { console.warn('⚠️ Canvas timeout – forçando ready'); clearInterval(iv); markReady(); }, 3000);
      return () => { clearInterval(iv); clearTimeout(to); window.removeEventListener('canvas:ready', onEvt); };
    }
    return () => window.removeEventListener('canvas:ready', onEvt);
  }, []);

  // 6) Fonts ready
  useEffect(() => {
    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; setFontsReady(true); } };
    (async () => {
      try {
        if (document.fonts?.load) { await document.fonts.load('900 8rem "Neue Haas Grotesk Display Pro"'); }
        else if (document.fonts?.ready) { await document.fonts.ready; }
      } catch { /* ignore */ }
      finally { done(); }
    })();
    const to = setTimeout(() => { console.warn('⚠️ Fonts forçadas por timeout'); done(); }, 2000);
    return () => clearTimeout(to);
  }, []);

  // 7) Saída coreografada
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
      .to({}, { duration: 0.25 }, 'start') // pausa

      // OUT no logo base (vermelho)
      .to(logoRedRef.current, {
        opacity: 0,
        rotationX: 90,
        z: -200,
        transformOrigin: '50% 100%',
        ease: 'power2.in',
        duration: 0.55,
      }, 'start+=0.25')

      // Liga cortinas e faz split
      .set([curtainLeftRef.current, curtainRightRef.current], { visibility: 'visible' }, 'start+=0.7')
      .to(curtainLeftRef.current,  { x: '-100%', duration: 0.9, ease: 'power3.inOut' }, 'start+=0.75')
      .to(curtainRightRef.current, { x: '100%',  duration: 0.9, ease: 'power3.inOut' }, 'start+=0.75');
  }, [onComplete, prefersReduced]);

  // 8) Gate da saída
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) animateExit();
  }, [fakeProgress, canvasReady, fontsReady, animateExit]);

  // 9) Render
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
      {/* Fundo neutral */}
      <div className="preloader__background" />

      {/* Logo central (camada dupla) */}
      <div className="preloader__center">
        <div className="preloader__logo-wrap">
          <h1 ref={logoRedRef} className="preloader__logo">SPOONFUL</h1>
          <h1 ref={logoLightRef} className="preloader__logo preloader__logo--light">SPOONFUL</h1>
        </div>
      </div>

      {/* Barra que preenche a tela */}
      <div ref={loaderBarRef} className="preloader__loader-bar" />

      {/* Cortinas para split */}
      <div ref={curtainLeftRef}  className="preloader__curtain preloader__curtain--left" />
      <div ref={curtainRightRef} className="preloader__curtain preloader__curtain--right" />
    </div>
  );
};

Preloader.propTypes = { onComplete: PropTypes.func.isRequired };
export default Preloader;
