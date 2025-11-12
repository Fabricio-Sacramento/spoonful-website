import assetLoader from './asset-loader.js';
import { projects } from '../scripts/projects.js';

class PreloaderController {
  constructor() {
    this.preloader = null;
    this.bar = null;
    this.progress = 0;
    this.targetProgress = 0;
    this.checkpoints = {
      windowLoad: false,
      canvasReady: false,
      fontsReady: false,
      assetsLoaded: false
    };
    this.isComplete = false;
    this.animationFrame = null;
    this.timeCheckInterval = null;

    // Configuração
    this.config = {
      minDuration: 8000,
      maxWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    };

    this.startTime = null;
    this.lastLoggedProgress = 0;

    // Resize handler com referência para cleanup
    this.resizeHandler = () => {
      if (this.isComplete) return;
      this.config.maxWidth = window.innerWidth;
      console.log(`📐 Viewport resized to ${window.innerWidth}px`);
    };

    // Registra listener de resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  init() {
    this.preloader = document.getElementById('preloader');
    this.bar = this.preloader?.querySelector('.preloader__bar');

    if (!this.preloader || !this.bar) {
      console.error('❌ Preloader elements not found');
      return;
    }

    console.log('⏳ Preloader initialized - REAL asset loading + full width bar');

    this.startTime = performance.now();

    this.setupListeners();
    this.checkFonts();
    this.loadAssets();
    this.startAnimationLoop();
    this.startTimeCheck();
  }

  setupListeners() {
    window.addEventListener('load', () => {
      console.log('✅ Window loaded');
      this.checkpoints.windowLoad = true;
      this.updateTargetProgress();
    });

    window.addEventListener('canvas:ready', () => {
      console.log('✅ Canvas ready');
      this.checkpoints.canvasReady = true;
      this.updateTargetProgress();
    });
  }

  async checkFonts() {
    try {
      await document.fonts.ready;
      console.log('✅ Fonts ready');
      this.checkpoints.fontsReady = true;
      this.updateTargetProgress();
    } catch (err) {
      console.warn('⚠️ Font loading check failed:', err);
      this.checkpoints.fontsReady = true;
      this.updateTargetProgress();
    }
  }

  async loadAssets() {
    try {
      const projectImages = [];
      
      projects.forEach(project => {
        if (project.image) {
          projectImages.push(project.image);
        }
        
        if (project.galleryImages && Array.isArray(project.galleryImages)) {
          projectImages.push(...project.galleryImages);
        }
      });

      console.log(`📦 Starting to load ${projectImages.length} project images`);

      assetLoader.onProgress((progress) => {
        if (progress >= 100) {
          this.checkpoints.assetsLoaded = true;
          this.updateTargetProgress();
        }
      });

      await assetLoader.loadImages(projectImages);

      console.log('✅ All assets loaded');
      this.checkpoints.assetsLoaded = true;
      this.updateTargetProgress();

    } catch (err) {
      console.error('❌ Error loading assets:', err);
      this.checkpoints.assetsLoaded = true;
      this.updateTargetProgress();
    }
  }

  startTimeCheck() {
    this.timeCheckInterval = setInterval(() => {
      if (!this.isComplete) {
        this.updateTargetProgress();
      }
    }, 100);
  }

  updateTargetProgress() {
    const completed = Object.values(this.checkpoints).filter(Boolean).length;
    const total = Object.keys(this.checkpoints).length;
    const technicalProgress = (completed / total) * 100;

    const elapsed = performance.now() - this.startTime;
    const timeProgress = Math.min((elapsed / this.config.minDuration) * 100, 100);

    this.targetProgress = Math.min(technicalProgress, timeProgress);

    const logThreshold = 5;
    if (Math.abs(this.targetProgress - this.lastLoggedProgress) >= logThreshold || this.targetProgress === 100) {
      console.log(`📊 Progress - Technical: ${technicalProgress.toFixed(0)}% | Time: ${timeProgress.toFixed(0)}% | Target: ${this.targetProgress.toFixed(0)}%`);
      this.lastLoggedProgress = this.targetProgress;
    }

    if (technicalProgress >= 100 && timeProgress >= 100 && !this.isComplete) {
      this.complete();
    }
  }

  startAnimationLoop() {
    const animate = () => {
      const diff = this.targetProgress - this.progress;
      this.progress += diff * 0.1;

      if (this.bar) {
        const width = (this.progress / 100) * this.config.maxWidth;
        this.bar.style.width = `${width}px`;
      }

      if (!this.isComplete) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  complete() {
    if (this.isComplete) return;
    this.isComplete = true;

    console.log('🎉 Preloader complete - preparing exit');

    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Força barra em 100% visual
    if (this.bar) {
      this.bar.style.width = `${this.config.maxWidth}px`;
      console.log(`✅ Bar forced to ${this.config.maxWidth}px (100%)`);
    }

    // Pequeno delay para garantir barra renderizada
    setTimeout(() => {
      this.exit();
    }, 300);
  }

  exit() {
    if (!this.preloader) return;

    console.log('🚀 Preloader exit sequence starting...');

    // FASE 1: Fade out do conteúdo (LOADING + barra)
    console.log('📉 Phase 1: Fading out content...');
    this.preloader.classList.add('preloader--fade-content');

    // FASE 2: Após fade out, abre as cortinas
    setTimeout(() => {
      console.log('🎬 Phase 2: Opening curtains...');
      this.preloader.classList.add('preloader--open-curtains');
    }, 300); // Aguarda fade out completar

    // FASE 3: Após cortinas abrirem, remove do DOM e emite evento
    setTimeout(() => {
      console.log('🗑️ Phase 3: Removing preloader from DOM...');
      
      // Remove do DOM
      this.preloader.classList.add('preloader--hidden');
      
      // Emite evento para liberar Hero e Nav
      window.dispatchEvent(new CustomEvent('preloader:complete'));
      
      console.log('✅ Preloader exit complete - curtains opened');
    }, 1100); // 300ms (fade) + 800ms (curtains)
  }

  forceComplete() {
    console.log('🔧 Force completing preloader');
    Object.keys(this.checkpoints).forEach(key => {
      this.checkpoints[key] = true;
    });
    this.startTime = performance.now() - this.config.minDuration;
    this.updateTargetProgress();
  }

  destroy() {
    console.log('🧹 Destroying preloader controller');
    
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (typeof window !== 'undefined' && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.preloader = null;
    this.bar = null;
  }
}

const preloaderController = new PreloaderController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    preloaderController.init();
  });
} else {
  preloaderController.init();
}

if (window.location.hash === '#debug') {
  window.debugPreloader = {
    force: () => preloaderController.forceComplete(),
    status: () => ({
      progress: preloaderController.progress.toFixed(1),
      target: preloaderController.targetProgress.toFixed(1),
      checkpoints: preloaderController.checkpoints,
      elapsed: ((performance.now() - preloaderController.startTime) / 1000).toFixed(1) + 's',
      assetsProgress: assetLoader.getProgress().toFixed(1) + '%',
      maxWidth: preloaderController.config.maxWidth + 'px'
    })
  };
}

export default preloaderController;