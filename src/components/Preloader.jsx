// src/components/Preloader.jsx
// Preloader: neutral dark + SPOONFUL (red) central + loader-bar com wipe “seco” red→light
// Saída: OUT nas duas camadas do logo → split (apaga neutral e barra) → revela site
//        + hero:animate-entry DISPARADO NO INÍCIO DO SPLIT (cena já visível por trás)

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
  // 1) Setup inicial (sem FOUC e z-order)
  // ---------------------------------------
  useEffect(() => {
    // Mantemos a classe 'preloading' apenas para sinalizar o estado;
    // não vamos mais esconder o body inteiro.
    document.documentElement.classList.add('preloading');

    // Logo base (red) preparado para OUT
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

    // Cortinas invisíveis até o split
    gsap.set([curtainLeftRef.current, curtainRightRef.current], {
      visibility: 'hidden',
      x: 0,
    });

    return () => {
      document.documentElement.classList.remove('preloading');
    };
  }, []);

  // -----------------------------------------------------------------
  // 2) Orquestração do loading (wipe “seco” = sem blur / sem tween CSS)
  //    - Atualiza width da barra e clip-path do logo light no mesmo tick
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!loaderBarRef.current || !logoLightRef.current) return;

    const setWidth = gsap.quickSetter(loaderBarRef.current, 'width', '%');
    const setClip  = (v) => {
      // Revela da esquerda → direita: 100→0% da margem direita
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
  // 3) Canvas readiness
  // ----------------------
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

  // -------------------
  // 4) Fonts readiness
  // -------------------
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

    const to = setTimeout(() => {
      console.warn('⚠️ Fonts forçadas por timeout');
      done();
    }, 2000);

    return () => clearTimeout(to);
  }, []);

  // -----------------------
  // 5) Saída coreografada
  // -----------------------
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
          // NÃO removemos aqui a classe; deixamos o AppRoot cuidar disso se necessário
          window.dispatchEvent(new CustomEvent('hero:animate-entry'));
          onComplete();
        },
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Após split, removemos o overlay
        el.style.display = 'none';
        onComplete();
      },
    });

    tl.addLabel('start')
      // Pausa elegante
      .to({}, { duration: 0.25 }, 'start')

      // OUT nas DUAS camadas (evita “piscar”)
      .to([logoRedRef.current, logoLightRef.current], {
        opacity: 0,
        rotationX: 90,
        z: -200,
        transformOrigin: '50% 100%',
        ease: 'power2.in',
        duration: 0.55,
      }, 'start+=0.25')

      // --- SPLIT: tudo sincronizado no mesmo frame ---
      .addLabel('split', 'start+=0.7')

      // 0) DISPARA O HERO *NO INÍCIO DO SPLIT* (adianta a cena por trás)
      .call(() => {
        window.dispatchEvent(new CustomEvent('hero:animate-entry'));
      }, null, 'split')

      // 1) Cortinas ficam visíveis (cobrindo 100%)
      .set([curtainLeftRef.current, curtainRightRef.current], { visibility: 'visible' }, 'split')

      // 2) Desliga a loader bar (senão ela pinta o fundo por trás do split)
      .set(loaderBarRef.current, { display: 'none' }, 'split')

      // 3) Apaga o fundo neutral (para o “vão” entre as cortinas revelar o HERO)
      .set(backgroundRef.current, { autoAlpha: 0 }, 'split')

      // 4) Move as cortinas para fora (revealing)
      .to(curtainLeftRef.current,  { x: '-100%', duration: 0.9, ease: 'power3.inOut' }, 'split+=0.05')
      .to(curtainRightRef.current, { x: '100%',  duration: 0.9, ease: 'power3.inOut' }, 'split+=0.05');
  }, [onComplete, prefersReduced]);

  // ------------------------
  // 6) Gate para disparar saída
  // ------------------------
  useEffect(() => {
    const allReady = fakeProgress >= 100 && canvasReady && fontsReady;
    if (allReady) animateExit();
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
