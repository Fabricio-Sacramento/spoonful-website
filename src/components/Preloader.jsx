// src/components/Preloader.jsx
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import styles from './Preloader.module.css';

/**
 * Preloader component
 * Emits: 'preloader:finished' (and sets window.__PRELOADER_FINISHED__ = true)
 * Listens: 'preloader:progress', 'preloader:assetsLoaded', 'preloader:fontsReady', 'canvas:ready'
 */

export default function Preloader({ minDisplay = 900, hardTimeout = 10000 }) {
  const containerRef = useRef(null);
  const curtainL = useRef(null);
  const curtainR = useRef(null);
  const loaderBar = useRef(null);
  const logoRed = useRef(null);
  const logoLight = useRef(null);
  const percentRef = useRef(null);
  const tlRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const startTs = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());
  const finished = useRef(false);

  // stable mutable proxy used by GSAP to smoothly animate numeric progress
  const progressProxyRef = useRef({ pct: 0 });

  useEffect(() => {
    // handlers
    function onProgress(e) {
      const pct =
        typeof e?.detail?.pct === 'number' ? e.detail.pct : Math.round(e?.detail ?? 0);

      // smooth to target using the stable ref object
      gsap.to(progressProxyRef.current, {
        pct,
        duration: 0.45,
        ease: 'power2.out',
        onUpdate() {
          const v = Math.round(progressProxyRef.current.pct);
          setProgress(v);
          if (loaderBar.current) loaderBar.current.style.width = `${v}%`;
          if (percentRef.current) percentRef.current.textContent = `${v}%`;
        }
      });
    }

    function onAssetsLoaded() {
      setAssetsLoaded(true);
      // ensure progress hits 100
      gsap.to(progressProxyRef.current, {
        pct: 100,
        duration: 0.6,
        ease: 'power3.out',
        onUpdate() {
          const v = Math.round(progressProxyRef.current.pct);
          setProgress(v);
          if (loaderBar.current) loaderBar.current.style.width = `${v}%`;
          if (percentRef.current) percentRef.current.textContent = `${v}%`;
        }
      });
    }

    function onFontsReady() {
      setFontsReady(true);
    }
    function onCanvasReady() {
      setCanvasReady(true);
    }

    window.addEventListener('preloader:progress', onProgress);
    window.addEventListener('preloader:assetsLoaded', onAssetsLoaded);
    window.addEventListener('preloader:fontsReady', onFontsReady);
    window.addEventListener('canvas:ready', onCanvasReady);

    // fonts fallback: if already ready
    if (document && document.fonts && document.fonts.status === 'loaded') {
      setFontsReady(true);
    } else if (document && document.fonts) {
      document.fonts
        .ready
        .then(() => {
          window.dispatchEvent(new Event('preloader:fontsReady'));
        })
        .catch(() => { /* ignore */ });
    }

    // hard timeout safeguard (depends on hardTimeout prop)
    const ht = setTimeout(() => {
      if (!finished.current) {
        // force finish gates
        setAssetsLoaded(true);
        setFontsReady(true);
        setCanvasReady(true);
      }
    }, hardTimeout);

    return () => {
      window.removeEventListener('preloader:progress', onProgress);
      window.removeEventListener('preloader:assetsLoaded', onAssetsLoaded);
      window.removeEventListener('preloader:fontsReady', onFontsReady);
      window.removeEventListener('canvas:ready', onCanvasReady);
      clearTimeout(ht);
    };
  }, [hardTimeout]); // include hardTimeout to satisfy linter

  useEffect(() => {
    // Trigger completion when conditions met
    const checkComplete = () => {
      if (finished.current) return;
      const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTs.current;
      const minElapsedOk = elapsed >= minDisplay;
      const progressOk = progress >= 99; // near 100
      const gatesOk = assetsLoaded && fontsReady; // canvasReady optional
      if (progressOk && minElapsedOk && gatesOk) {
        finished.current = true;
        runExit();
      }
    };

    // run initial check and then poll
    checkComplete();
    const iv = setInterval(checkComplete, 120);
    return () => clearInterval(iv);
    // include minDisplay in deps to satisfy linter
  }, [progress, assetsLoaded, fontsReady, canvasReady, minDisplay]);

  function runExit() {
    // set global flag
    try {
      window.__PRELOADER_FINISHED__ = true;
      const ev = new Event('preloader:finished');
      window.dispatchEvent(ev);
    } catch {
      // ignore if window isn't writable (very edge)
    }

    // exit timeline similar to CodePen: wipe then curtains open
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 0.7, ease: 'power2.inOut' },
        onComplete: () => {
          // remove from DOM after animation
          if (containerRef.current) containerRef.current.style.display = 'none';
        }
      });

      // animate percent up and fade
      if (percentRef.current) tl.to(percentRef.current, { y: -30, autoAlpha: 0 }, 0);
      // expand loader a touch
      if (loaderBar.current) tl.to(loaderBar.current, { scaleX: 1.05, duration: 0.5 }, 0);

      // crossfade logos
      if (logoRed.current) tl.to(logoRed.current, { autoAlpha: 0, duration: 0.35 }, 0.15);
      if (logoLight.current) tl.to(logoLight.current, { autoAlpha: 1, duration: 0.35 }, 0.15);

      // curtains open
      if (curtainL.current) tl.to(curtainL.current, { xPercent: -120, duration: 0.8, ease: 'power3.out' }, 0.4);
      if (curtainR.current) tl.to(curtainR.current, { xPercent: 120, duration: 0.8, ease: 'power3.out' }, 0.4);

      // fade out wrapper
      if (containerRef.current) tl.to(containerRef.current, { autoAlpha: 0, duration: 0.6 }, 1.2);
    }, containerRef);

    tlRef.current = ctx;
  }

  // initial mount animation: show curtains closed, logos in place
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (logoLight.current) gsap.set(logoLight.current, { autoAlpha: 0 });
      if (curtainL.current && curtainR.current) gsap.set([curtainL.current, curtainR.current], { xPercent: 0 });
      if (loaderBar.current) gsap.set(loaderBar.current, { width: '0%' });
      if (percentRef.current) gsap.set(percentRef.current, { autoAlpha: 1 });
      // subtle scale intro
      if (logoRed.current) gsap.fromTo(logoRed.current, { y: 0, scale: 0.995 }, { scale: 1, duration: 0.6 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.preloader} ref={containerRef} aria-hidden="false">
      <div className={styles.curtain} ref={curtainL} aria-hidden="true" />
      <div className={styles.curtain} ref={curtainR} aria-hidden="true" style={{ right: 0, left: 'auto' }} />
      <div className={styles.center}>
        <div className={styles.logoWrap}>
          <div className={styles.logoRed} ref={logoRed}>SPOONFUL</div>
          <div className={styles.logoLight} ref={logoLight}>SPOONFUL</div>
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} ref={loaderBar} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.percent} ref={percentRef}>{progress}%</div>
      </div>
    </div>
  );
}

Preloader.propTypes = {
  minDisplay: PropTypes.number,
  hardTimeout: PropTypes.number
};
