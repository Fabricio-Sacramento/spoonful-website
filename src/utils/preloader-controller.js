// src/utils/preloader-controller.js
// Controla carregamento REAL de assets + timing controlado

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
      assetsLoaded: false  // ⬅️ NOVO
    };
    this.isComplete = false;
    this.animationFrame = null;
    this.timeCheckInterval = null;
    
    this.config = {
      minDuration: 5000,
      maxWidth: 250,
    };
    
    this.startTime = null;
    this.lastLoggedProgress = 0;
  }

  init() {
    this.preloader = document.getElementById('preloader');
    this.bar = this.preloader?.querySelector('.preloader__bar');

    if (!this.preloader || !this.bar) {
      console.error('❌ Preloader elements not found');
      return;
    }

    console.log('⏳ Preloader initialized - REAL asset loading enabled');

    this.startTime = performance.now();

    this.setupListeners();
    this.checkFonts();
    this.loadAssets();  // ⬅️ NOVO
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

  // ⬇️ NOVO: Carrega assets reais
  async loadAssets() {
    try {
      // Coleta todas as imagens dos projetos
      const projectImages = [];
      
      projects.forEach(project => {
        // Imagem principal
        if (project.image) {
          projectImages.push(project.image);
        }
        
        // Galeria (5 imagens por projeto)
        if (project.galleryImages && Array.isArray(project.galleryImages)) {
          projectImages.push(...project.galleryImages);
        }
      });

      // Imagens do About (se quiser incluir)
      // const profileImage = '../assets/images/Me-4.jpg';
      // const brandLogos = [...]; // 17 logos
      // projectImages.push(profileImage, ...brandLogos);

      console.log(`📦 Starting to load ${projectImages.length} project images`);

      // Escuta progresso granular
      assetLoader.onProgress((progress) => {
        // Atualiza checkpoint parcialmente (0-100%)
        // Não marca como true até 100%
        if (progress >= 100) {
          this.checkpoints.assetsLoaded = true;
          this.updateTargetProgress();
        }
      });

      // Inicia carregamento
      await assetLoader.loadImages(projectImages);

      console.log('✅ All assets loaded');
      this.checkpoints.assetsLoaded = true;
      this.updateTargetProgress();

    } catch (err) {
      console.error('❌ Error loading assets:', err);
      // Continua mesmo com erro (não bloqueia site)
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
    // Calcula progresso técnico (0-100)
    const completed = Object.values(this.checkpoints).filter(Boolean).length;
    const total = Object.keys(this.checkpoints).length;
    const technicalProgress = (completed / total) * 100;

    // Calcula progresso temporal (0-100)
    const elapsed = performance.now() - this.startTime;
    const timeProgress = Math.min((elapsed / this.config.minDuration) * 100, 100);

    // Progresso real = menor dos dois
    this.targetProgress = Math.min(technicalProgress, timeProgress);

    // Log reduzido
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

    console.log('🎉 Preloader complete - starting exit');

    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    if (this.bar) {
      this.bar.style.width = `${this.config.maxWidth}px`;
    }

    setTimeout(() => {
      this.exit();
    }, 300);
  }

  exit() {
    if (!this.preloader) return;

    console.log('🚀 Preloader exiting...');

    this.preloader.classList.add('preloader--exiting');

    setTimeout(() => {
      this.preloader.classList.add('preloader--hidden');
      window.dispatchEvent(new CustomEvent('preloader:complete'));
      console.log('✅ Preloader exit complete');
    }, 600);
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
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
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
      assetsProgress: assetLoader.getProgress().toFixed(1) + '%'
    })
  };
}

export default preloaderController;