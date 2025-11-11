// src/utils/preloader-controller.js
// Controla carregamento e saída do preloader

class PreloaderController {
  constructor() {
    this.preloader = null;
    this.bar = null;
    this.progress = 0;
    this.checkpoints = {
      windowLoad: false,
      canvasReady: false,
      fontsReady: false
    };
    this.isComplete = false;
  }

  init() {
    this.preloader = document.getElementById('preloader');
    this.bar = this.preloader?.querySelector('.preloader__bar');

    if (!this.preloader || !this.bar) {
      console.error('❌ Preloader elements not found');
      return;
    }

    console.log('⏳ Preloader initialized');

    // Escuta eventos de carregamento
    this.setupListeners();
    
    // Inicia checagem de fontes
    this.checkFonts();
  }

  setupListeners() {
    // Window load
    window.addEventListener('load', () => {
      console.log('✅ Window loaded');
      this.checkpoints.windowLoad = true;
      this.updateProgress();
    });

    // Canvas ready (emitido pelo App.jsx)
    window.addEventListener('canvas:ready', () => {
      console.log('✅ Canvas ready');
      this.checkpoints.canvasReady = true;
      this.updateProgress();
    });
  }

  async checkFonts() {
    try {
      // Aguarda fontes carregarem
      await document.fonts.ready;
      console.log('✅ Fonts ready');
      this.checkpoints.fontsReady = true;
      this.updateProgress();
    } catch (err) {
      console.warn('⚠️ Font loading check failed:', err);
      // Continua mesmo com erro
      this.checkpoints.fontsReady = true;
      this.updateProgress();
    }
  }

  updateProgress() {
    // Calcula progresso baseado nos checkpoints
    const completed = Object.values(this.checkpoints).filter(Boolean).length;
    const total = Object.keys(this.checkpoints).length;
    this.progress = (completed / total) * 100;

    console.log(`📊 Progress: ${this.progress}%`, this.checkpoints);

    // Atualiza barra visual
    if (this.bar) {
      this.bar.style.width = `${this.progress}px`;
    }

    // Se chegou em 100%, inicia saída
    if (this.progress >= 100 && !this.isComplete) {
      this.complete();
    }
  }

  complete() {
    if (this.isComplete) return;
    this.isComplete = true;

    console.log('🎉 Preloader complete - starting exit');

    // Pequeno delay para garantir que barra chegou visualmente em 100px
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
    Object.keys(this.checkpoints).forEach(key => {
      this.checkpoints[key] = true;
    });
    this.updateProgress();
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

export default preloaderController;