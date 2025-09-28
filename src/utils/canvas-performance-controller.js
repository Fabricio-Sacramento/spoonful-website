// src/utils/canvas-performance-controller.js
// Controla montagem/desmontagem do Canvas React baseado no scroll

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactDOM from 'react-dom/client';

class CanvasPerformanceController {
  constructor() {
    this.isCanvasMounted = true;
    this.reactRoot = null;
    this.canvasComponent = null;
    this.container = null;
    this.lastProgress = 0;
    this.debounceTimeout = null;
    this.cleanupFn = null; // Função de cleanup registrada
    
    this.thresholds = {
      unmountProgress: 0.28,   // 38% - logo após clipRects (35%) terminarem
      remountProgress: 0.18    // 25% - mantém zona morta de 13%
    };
  }

  /**
   * Inicializa o controller com referências do React
   */
  init(reactRoot, canvasComponent) {
    this.reactRoot = reactRoot;
    this.canvasComponent = canvasComponent;
    this.container = document.getElementById('root');
    
    if (!this.container) {
      console.error('Container #root não encontrado');
      return;
    }

    console.log('Canvas Performance Controller inicializado');
    
    // Aguarda GSAP setup e cria ScrollTrigger dedicado
    gsap.delayedCall(0.3, () => {
      this.createScrollMonitor();
    });
  }

  /**
   * Registra função de cleanup para ser chamada antes do unmount
   */
  registerCleanup(fn) {
    if (typeof fn !== 'function') return;
    this.cleanupFn = fn;
    console.log('Cleanup function registrada');
  }

  /**
   * Cria ScrollTrigger para monitorar progresso da timeline principal
   */
  createScrollMonitor() {
    ScrollTrigger.create({
      trigger: '.intro-wrapper',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        this.handleScrollProgress(self.progress);
      },
      refreshPriority: 1  // Baixa prioridade para não interferir
    });

    console.log('Canvas monitor ativo - thresholds:', this.thresholds);
  }

  /**
   * Monitora progresso e controla lifecycle do Canvas
   */
  handleScrollProgress(progress) {
    // Cancela operação anterior se ainda estiver pendente
    clearTimeout(this.debounceTimeout);
    
    // Debounce para evitar múltiplos ciclos muito rápidos
    this.debounceTimeout = setTimeout(() => {
      const isMovingForward = progress > this.lastProgress;
      
      // UNMOUNT: Indo para frente e Canvas ainda montado
      if (isMovingForward && 
          progress >= this.thresholds.unmountProgress && 
          this.isCanvasMounted) {
        this.unmountCanvas();
      }
      
      // REMOUNT: Voltando e Canvas desmontado  
      if (!isMovingForward && 
          progress <= this.thresholds.remountProgress && 
          !this.isCanvasMounted) {
        this.remountCanvas();
      }

      this.lastProgress = progress;
    }, 150); // 150ms de debounce
  }

  /**
   * Desmonta Canvas React com cleanup gracioso - versão robusta
   */
  async unmountCanvas() {
    if (!this.isCanvasMounted || !this.reactRoot || !this.container) return;
    console.log('UNMOUNTING Canvas - Performance mode ON (graceful)');

    try {
      if (this.cleanupFn) {
        try {
          await Promise.race([
            Promise.resolve().then(() => this.cleanupFn()),
            new Promise((_, rej) => setTimeout(() => rej(new Error('cleanup timeout')), 1500))
          ]);
          console.log('Cleanup completed');
        } catch (err) {
          console.warn('Cleanup failed or timed out, continuing with unmount', err);
        }
      }

      // give a tiny gap to avoid colliding with UI animations
      await new Promise(res => setTimeout(res, 80));

      // reactRoot.unmount() pode lançar se já desmontado — proteja
      try {
        if (this.reactRoot) {
          this.reactRoot.unmount();
        }
      } catch(e) {
        console.warn('reactRoot.unmount failed', e);
      }

      // cleanup container html (placeholder)
      try {
        this.container.innerHTML = '<div style="width:100%;height:100vh;background:transparent;"></div>';
      } catch(e) { console.warn('container cleanup failed', e); }

      // ensure we clear reactRoot reference
      this.reactRoot = null;
      this.isCanvasMounted = false;
      console.log('Canvas unmounted successfully (graceful)');
    } catch (error) {
      console.error('Erro ao desmontar Canvas:', error);
    }
  }

  /**
   * Remonta Canvas React
   */
  remountCanvas() {
    if (this.isCanvasMounted || !this.canvasComponent || !this.container) return;
    console.log('REMOUNTING Canvas - 3D mode ON');
    try {
      // recreate ReactRoot
      this.reactRoot = ReactDOM.createRoot(this.container);
      this.reactRoot.render(this.canvasComponent);
      this.isCanvasMounted = true;
      console.log('Canvas remounted successfully');
    } catch (error) {
      console.error('Erro ao remontar Canvas:', error);
    }
  }

  /**
   * Debug helpers - mantendo nomes originais
   */
  forceKill() { this.unmountCanvas(); }
  forceResume() { this.remountCanvas(); }
  
  getStatus() {
    return {
      isMounted: this.isCanvasMounted,
      hasRoot: !!this.reactRoot,
      hasContainer: !!this.container,
      hasCleanup: !!this.cleanupFn,
      thresholds: this.thresholds,
      lastProgress: this.lastProgress
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.reactRoot && this.isCanvasMounted) {
      this.reactRoot.unmount();
    }
    clearTimeout(this.debounceTimeout);
    this.reactRoot = null;
    this.canvasComponent = null;
    this.container = null;
    this.cleanupFn = null;
    console.log('Canvas Performance Controller destroyed');
  }
}

// Singleton
const canvasController = new CanvasPerformanceController();
export default canvasController;