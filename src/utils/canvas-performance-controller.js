/**
   * Conecta aos callbacks do ScrollTrigger principal
   */// src/utils/canvas-performance-controller.js
// Sistema de controle de performance do Canvas 3D integrado ao GSAP

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

class CanvasPerformanceController {
  constructor() {
    this.canvasContainer = null;
    this.canvas3DComponent = null;
    this.isCanvasActive = true;
    this.lastProgress = 0;
    this.thresholds = {
      killProgress: 0.4,    // 40% da timeline hero->about (após clipRects)
      resumeProgress: 0.35  // 35% no reverso (pequena folga)
    };
    
    this.onCanvasStateChange = null; // Callback opcional para debug
  }

  /**
   * Inicializa o controller após o setup do GSAP
   * Deve ser chamado DEPOIS de initHeroAboutTimeline()
   */
  init(canvasContainer, canvas3DComponent, onStateChange = null) {
    this.canvasContainer = canvasContainer;
    this.canvas3DComponent = canvas3DComponent;
    this.onCanvasStateChange = onStateChange;

    // Aguarda o ScrollTrigger da timeline principal estar pronto
    gsap.delayedCall(0.2, () => {
      this.attachToMainTimeline();
    });

    console.log('🎮 Canvas Performance Controller inicializado');
  }

  /**
   * Conecta aos callbacks do ScrollTrigger principal
   */
  attachToMainTimeline() {
    // Ao invés de interceptar, cria um ScrollTrigger dedicado para performance
    console.log('Criando ScrollTrigger dedicado para performance...');
    
    ScrollTrigger.create({
      trigger: '.intro-wrapper',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        this.handleTimelineProgress(self.progress);
      },
      onToggle: (self) => {
        console.log(`ScrollTrigger toggle: active=${self.isActive}, progress=${self.progress}`);
      }
    });

    console.log('🔗 Controller conectado com ScrollTrigger dedicado');
  }

  /**
   * Monitora progresso da timeline e controla Canvas
   */
  handleTimelineProgress(progress) {
    const isMovingForward = progress > this.lastProgress;
    
    // Throttle logs para evitar spam
    if (Math.abs(progress - this.lastProgress) > 0.01) {
      console.log(`📊 Progress: ${progress.toFixed(3)} | Forward: ${isMovingForward} | Active: ${this.isCanvasActive}`);
    }
    
    // KILL: Indo para frente e passando do threshold
    if (isMovingForward && progress >= this.thresholds.killProgress && this.isCanvasActive) {
      console.log('🚫 KILLING Canvas at progress:', progress);
      this.killCanvas();
    }
    
    // RESUME: Voltando e antes do threshold de resume
    if (!isMovingForward && progress <= this.thresholds.resumeProgress && !this.isCanvasActive) {
      console.log('✅ RESUMING Canvas at progress:', progress);
      this.resumeCanvas();
    }

    this.lastProgress = progress;
  }

  /**
   * Remove Canvas do DOM - Performance máxima
   */
  killCanvas() {
    if (!this.isCanvasActive || !this.canvasContainer) return;

    console.log('🚫 Killing Canvas - Performance mode ON');
    
    // Fade out suave
    gsap.to(this.canvasContainer, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        // Remove do DOM após fade
        if (this.canvasContainer?.style) {
          this.canvasContainer.style.display = 'none';
        }
      }
    });

    this.isCanvasActive = false;
    
    if (this.onCanvasStateChange) {
      this.onCanvasStateChange('killed');
    }
  }

  /**
   * Restaura Canvas no DOM
   */
  resumeCanvas() {
    if (this.isCanvasActive || !this.canvasContainer) return;

    console.log('✅ Resuming Canvas - 3D mode ON');

    // Restaura display e fade in
    this.canvasContainer.style.display = 'block';
    gsap.fromTo(this.canvasContainer, 
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }
    );

    this.isCanvasActive = true;
    
    if (this.onCanvasStateChange) {
      this.onCanvasStateChange('resumed');
    }
  }

  /**
   * Force kill para testes
   */
  forceKill() {
    this.killCanvas();
  }

  /**
   * Force resume para testes
   */
  forceResume() {
    this.resumeCanvas();
  }

  /**
   * Status atual
   */
  getStatus() {
    return {
      isActive: this.isCanvasActive,
      lastProgress: this.lastProgress,
      thresholds: this.thresholds
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    this.canvasContainer = null;
    this.onCanvasStateChange = null;
    console.log('Canvas Performance Controller destroyed');
  }
}

// Singleton instance
const canvasController = new CanvasPerformanceController();

export default canvasController;