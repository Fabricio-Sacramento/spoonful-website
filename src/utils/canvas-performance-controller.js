// src/utils/canvas-performance-controller.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactDOM from 'react-dom/client';

if (typeof window !== 'undefined' && window.__R3F_CONTEXT_LOST === undefined) {
  window.__R3F_CONTEXT_LOST = false;
}

class CanvasPerformanceController {
  constructor() {
    this.isCanvasMounted = true;
    this.reactRoot = null;
    this.canvasComponent = null;
    this.container = null;
    this.lastProgress = 0;
    this.debounceTimeout = null;
    this.cleanupFns = new Set(); // <-- multiple cleanups supported
    this.isMobileMode = false; // <-- NEW: flag para modo mobile

    this.thresholds = {
      unmountProgress: 0.28,
      remountProgress: 0.18
    };
  }

  init(reactRoot, canvasComponent) {
    // ========================================
    // MOBILE/TABLET: Skip controller completo
    // ========================================
    const isMobile = window.innerWidth <= 1023;
    
    if (isMobile) {
      console.log('📱 Mobile: Canvas permanente - Controller desabilitado');
      this.isMobileMode = true;
      this.reactRoot = reactRoot;
      this.canvasComponent = canvasComponent;
      this.container = document.getElementById('root');
      return; // <-- Early return, não cria ScrollTrigger
    }
    
    // ========================================
    // DESKTOP: Comportamento normal
    // ========================================
    this.reactRoot = reactRoot;
    this.canvasComponent = canvasComponent;
    this.container = document.getElementById('root');

    if (!this.container) {
      console.error('Container #root não encontrado');
      return;
    }

    gsap.delayedCall(0.3, () => {
      this.createScrollMonitor();
    });
  }

  /**
   * Register cleanup. Returns an unregister function.
   */
  registerCleanup(fn) {
    if (typeof fn !== 'function') return () => {};
    if (this.cleanupFns.has(fn)) {
      console.warn('cleanup already registered — ignoring duplicate registration');
      return () => this.cleanupFns.delete(fn);
    }
    this.cleanupFns.add(fn);

    // return unregistrar
    return () => {
      const removed = this.cleanupFns.delete(fn);
    };
  }

  createScrollMonitor() {
    ScrollTrigger.create({
      trigger: '.intro-wrapper',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        this.handleScrollProgress(self.progress);
      },
      refreshPriority: 1
    });

  }

  handleScrollProgress(progress) {
    // Mobile: Ignora completamente
    if (this.isMobileMode) return;
    
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      const isMovingForward = progress > this.lastProgress;

      if (isMovingForward &&
          progress >= this.thresholds.unmountProgress &&
          this.isCanvasMounted) {
        this.unmountCanvas();
      }

      if (!isMovingForward &&
          progress <= this.thresholds.remountProgress &&
          !this.isCanvasMounted) {
        this.remountCanvas();
      }

      this.lastProgress = progress;
    }, 150);
  }

  /**
   * Call all registered cleanup functions (best-effort, with timeout).
   */
  async _callAllCleanups(timeout = 1500) {
    if (this.cleanupFns.size === 0) return;
    const fns = Array.from(this.cleanupFns);
    try {
      await Promise.race([
        Promise.allSettled(fns.map(fn => Promise.resolve().then(() => fn()))),
        new Promise((_, rej) => setTimeout(() => rej(new Error('cleanup timeout')), timeout))
      ]);
    } catch (err) {
      console.warn('Some cleanupFns timed out or failed, continuing', err);
    }
  }

  async unmountCanvas() {
    // Mobile: Nunca desmonta
    if (this.isMobileMode) {
      console.log('📱 Mobile: Unmount bloqueado');
      return;
    }
    
    if (!this.isCanvasMounted || !this.reactRoot || !this.container) return;

    try {
      if (typeof window !== 'undefined') window.__R3F_CONTEXT_LOST = true;

      // call all registered cleanup functions
      await this._callAllCleanups(1500);

      // small gap to avoid colliding with UI animations
      await new Promise(res => setTimeout(res, 80));

      try {
        if (this.reactRoot) this.reactRoot.unmount();
      } catch (e) {
        console.warn('reactRoot.unmount failed', e);
      }

      try {
        this.container.innerHTML = '<div style="width:100%;height:100vh;background:transparent;"></div>';
      } catch (e) {
        console.warn('container cleanup failed', e);
      }

      this.reactRoot = null;
      this.isCanvasMounted = false;
    } catch (error) {
      console.error('Erro ao desmontar Canvas:', error);
    }
  }

  remountCanvas() {
    // Mobile: Nunca remonta (porque nunca desmonta)
    if (this.isMobileMode) {
      console.log('📱 Mobile: Remount bloqueado');
      return;
    }
    
    if (this.isCanvasMounted || !this.canvasComponent || !this.container) return;
    try {
      this.reactRoot = ReactDOM.createRoot(this.container);
      this.reactRoot.render(this.canvasComponent);
      this.isCanvasMounted = true;
      if (typeof window !== 'undefined') window.__R3F_CONTEXT_LOST = false;
    } catch (error) {
      console.error('Erro ao remontar Canvas:', error);
    }
  }

  forceKill() { 
    if (this.isMobileMode) {
      console.warn('📱 Mobile: forceKill ignorado');
      return;
    }
    this.unmountCanvas(); 
  }
  
  forceResume() { 
    if (this.isMobileMode) {
      console.warn('📱 Mobile: forceResume ignorado');
      return;
    }
    this.remountCanvas(); 
  }

  getStatus() {
    return {
      isMounted: this.isCanvasMounted,
      hasRoot: !!this.reactRoot,
      hasContainer: !!this.container,
      cleanupCount: this.cleanupFns.size,
      thresholds: this.thresholds,
      lastProgress: this.lastProgress,
      isMobileMode: this.isMobileMode // <-- NEW
    };
  }

  destroy() {
    if (this.reactRoot && this.isCanvasMounted) this.reactRoot.unmount();
    clearTimeout(this.debounceTimeout);
    this.reactRoot = null;
    this.canvasComponent = null;
    this.container = null;
    this.cleanupFns.clear();
  }
}

const canvasController = new CanvasPerformanceController();
export default canvasController;