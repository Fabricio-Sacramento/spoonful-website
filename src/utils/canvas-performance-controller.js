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
    
    this.thresholds = {
      unmountProgress: 0.4,   // 40% - após clipRects completarem
      remountProgress: 0.35   // 35% - pequena folga para remount
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
  }

  /**
   * Desmonta Canvas React - Performance máxima
   */
  unmountCanvas() {
    if (!this.isCanvasMounted || !this.reactRoot) return;

    console.log('UNMOUNTING Canvas - Performance mode ON');
    
    try {
      // Desmonta React cleanly
      this.reactRoot.unmount();
      
      // Limpa container deixando apenas um placeholder
      this.container.innerHTML = '<div style="width:100%;height:100vh;background:transparent;"></div>';
      
      this.isCanvasMounted = false;
      console.log('Canvas unmounted successfully');
      
    } catch (error) {
      console.error('Erro ao desmontar Canvas:', error);
    }
  }

  /**
   * Remonta Canvas React
   */
  remountCanvas() {
    if (this.isCanvasMounted || !this.canvasComponent) return;

    console.log('REMOUNTING Canvas - 3D mode ON');
    
    try {
      // Recria ReactRoot no mesmo container
      this.reactRoot = ReactDOM.createRoot(this.container);
      
      // Renderiza Canvas novamente
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
    this.reactRoot = null;
    this.canvasComponent = null;
    this.container = null;
    console.log('Canvas Performance Controller destroyed');
  }
}

// Singleton
const canvasController = new CanvasPerformanceController();
export default canvasController;