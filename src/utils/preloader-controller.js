// src/utils/preloader-controller.js
// Controla carregamento e saída do preloader com timing controlado

class PreloaderController {
  constructor() {
    this.preloader = null;
    this.bar = null;
    this.progress = 0;
    this.targetProgress = 0;
    this.checkpoints = {
      windowLoad: false,
      canvasReady: false,
      fontsReady: false
    };
    this.isComplete = false;
    this.animationFrame = null;
    this.timeCheckInterval = null; // ⬅️ NOVO
    
    // Configuração de timing
    this.config = {
      minDuration: 5000, // 5 segundos mínimo
      maxWidth: 250,     // 250px de largura total
    };
    
    this.startTime = null;
  }

  init() {
    this.preloader = document.getElementById('preloader');
    this.bar = this.preloader?.querySelector('.preloader__bar');

    if (!this.preloader || !this.bar) {
      console.error('❌ Preloader elements not found');
      return;
    }

    console.log('⏳ Preloader initialized - minimum duration: 5s');

    // Marca tempo de início
    this.startTime = performance.now();

    // Escuta eventos de carregamento
    this.setupListeners();
    
    // Inicia checagem de fontes
    this.checkFonts();
    
    // Inicia loop de animação suave
    this.startAnimationLoop();
    
    // ⬇️ NOVO: Timer contínuo para verificar progresso temporal
    this.startTimeCheck();
  }

  setupListeners() {
    // Window load
    window.addEventListener('load', () => {
      console.log('✅ Window loaded');
      this.checkpoints.windowLoad = true;
      this.updateTargetProgress();
    });

    // Canvas ready (emitido pelo App.jsx)
    window.addEventListener('canvas:ready', () => {
      console.log('✅ Canvas ready');
      this.checkpoints.canvasReady = true;
      this.updateTargetProgress();
    });
  }

  async checkFonts() {
    try {
      // Aguarda fontes carregarem
      await document.fonts.ready;
      console.log('✅ Fonts ready');
      this.checkpoints.fontsReady = true;
      this.updateTargetProgress();
    } catch (err) {
      console.warn('⚠️ Font loading check failed:', err);
      // Continua mesmo com erro
      this.checkpoints.fontsReady = true;
      this.updateTargetProgress();
    }
  }

  // ⬇️ NOVO: Verifica progresso temporal continuamente
  startTimeCheck() {
    this.timeCheckInterval = setInterval(() => {
      if (!this.isComplete) {
        this.updateTargetProgress();
      }
    }, 100); // Atualiza a cada 100ms
  }

  updateTargetProgress() {
    // Calcula progresso técnico (0-100)
    const completed = Object.values(this.checkpoints).filter(Boolean).length;
    const total = Object.keys(this.checkpoints).length;
    const technicalProgress = (completed / total) * 100;

    // Calcula progresso temporal (0-100)
    const elapsed = performance.now() - this.startTime;
    const timeProgress = Math.min((elapsed / this.config.minDuration) * 100, 100);

    // Progresso real = menor dos dois (garante 5s mínimo)
    this.targetProgress = Math.min(technicalProgress, timeProgress);

    // Log apenas se mudou significativamente (reduz spam no console)
    const logThreshold = 5;
    if (Math.abs(this.targetProgress - this.lastLoggedProgress) >= logThreshold || this.targetProgress === 100) {
      console.log(`📊 Progress - Technical: ${technicalProgress.toFixed(0)}% | Time: ${timeProgress.toFixed(0)}% | Target: ${this.targetProgress.toFixed(0)}%`);
      this.lastLoggedProgress = this.targetProgress;
    }

    // Se ambos chegaram em 100%, completa
    if (technicalProgress >= 100 && timeProgress >= 100 && !this.isComplete) {
      this.complete();
    }
  }

  startAnimationLoop() {
    const animate = () => {
      // Interpola suavemente para o target
      const diff = this.targetProgress - this.progress;
      this.progress += diff * 0.1; // Suavização (ease out)

      // Atualiza barra visual (0 a 250px)
      if (this.bar) {
        const width = (this.progress / 100) * this.config.maxWidth;
        this.bar.style.width = `${width}px`;
      }

      // Continua loop até completar
      if (!this.isComplete) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  complete() {
    if (this.isComplete) return;
    this.isComplete = true;

    console.log('🎉 Preloader complete - starting exit');

    // ⬇️ NOVO: Para timer de checagem temporal
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }

    // Cancela animation loop
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Força barra em 100% visual
    if (this.bar) {
      this.bar.style.width = `${this.config.maxWidth}px`;
    }

    // Pequeno delay para garantir que barra chegou visualmente em 250px
    setTimeout(() => {
      this.exit();
    }, 300);
  }

  exit() {
    if (!this.preloader) return;

    console.log('🚀 Preloader exiting...');

    // Adiciona classe de animação
    this.preloader.classList.add('preloader--exiting');

    // Aguarda animação terminar
    setTimeout(() => {
      // Remove do DOM
      this.preloader.classList.add('preloader--hidden');
      
      // Emite evento para liberar Hero e Nav
      window.dispatchEvent(new CustomEvent('preloader:complete'));
      
      console.log('✅ Preloader exit complete');
    }, 600); // Tempo da animação swipeUp
  }

  // API pública para forçar conclusão (debug)
  forceComplete() {
    console.log('🔧 Force completing preloader');
    
    // Marca todos os checkpoints
    Object.keys(this.checkpoints).forEach(key => {
      this.checkpoints[key] = true;
    });
    
    // Força tempo mínimo completo
    this.startTime = performance.now() - this.config.minDuration;
    
    this.updateTargetProgress();
  }

  // Cleanup
  destroy() {
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Singleton
const preloaderController = new PreloaderController();

// Auto-init quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    preloaderController.init();
  });
} else {
  preloaderController.init();
}

// Debug helper
if (window.location.hash === '#debug') {
  window.debugPreloader = {
    force: () => preloaderController.forceComplete(),
    status: () => ({
      progress: preloaderController.progress.toFixed(1),
      target: preloaderController.targetProgress.toFixed(1),
      checkpoints: preloaderController.checkpoints,
      elapsed: ((performance.now() - preloaderController.startTime) / 1000).toFixed(1) + 's'
    })
  };
}

export default preloaderController;