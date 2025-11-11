// src/utils/PreloaderManager.js
// VERSÃO CORRIGIDA - Evita interferência com interactions existentes

import gsap from 'gsap';

class PreloaderManager {
  constructor() {
    this.progress = 0;
    this.isComplete = false;
    this.assets = {
      canvas: false,
      fonts: false,
      images: false
    };
    
    // Elementos DOM
    this.preloader = null;
    this.preloaderContent = null;
    this.loadingText = null;
    this.counter = null;
    this.welcomeEl = null;
    this.welcomeText = null;
    
    // Configurações
    this.maxFontSize = 19.4375; // rem - tamanho final da spec
    this.minFontSize = 1.5;     // rem - tamanho inicial
    
    this.init();
  }

  init() {
    this.createPreloaderHTML();
    this.bindElements();
    this.startAssetMonitoring();
  }

  createPreloaderHTML() {
    // Remove preloader existente se houver
    const existing = document.getElementById('preloader');
    if (existing) existing.remove();

    // Cria estrutura do preloader COM CUIDADO no z-index
    const preloaderHTML = `
      <div id="preloader" class="preloader" style="z-index: 9999; pointer-events: auto;">
        <div class="preloader-content">
          <span class="preloader-text">LOADING</span>
          <span class="preloader-counter">000</span>
        </div>
      </div>
      <div class="preloader-welcome" style="z-index: 9999; pointer-events: none;">
        <h1 class="preloader-welcome-text">WELCOME TO SPOONFUL</h1>
      </div>
    `;

    // Adiciona ao body
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
  }

  bindElements() {
    this.preloader = document.getElementById('preloader');
    this.preloaderContent = document.querySelector('.preloader-content');
    this.loadingText = document.querySelector('.preloader-text');
    this.counter = document.querySelector('.preloader-counter');
    this.welcomeEl = document.querySelector('.preloader-welcome');
    this.welcomeText = document.querySelector('.preloader-welcome-text');

    if (!this.preloader || !this.loadingText || !this.counter) {
      console.error('PreloaderManager: Elementos essenciais não encontrados');
      return false;
    }

    console.log('✅ PreloaderManager: Elementos vinculados');
    return true;
  }

  startAssetMonitoring() {
    // 1. Monitora Canvas 3D
    this.monitorCanvas();
    
    // 2. Monitora fontes
    this.monitorFonts();
    
    // 3. Monitora imagens críticas
    this.monitorImages();
    
    // Inicia loop de update
    this.updateProgress();
  }

  monitorCanvas() {
    // Escuta evento existente do Canvas
    const handleCanvasReady = () => {
      console.log('🎨 Canvas ready detected');
      this.assets.canvas = true;
      window.removeEventListener('canvas:ready', handleCanvasReady);
    };

    window.addEventListener('canvas:ready', handleCanvasReady);
    
    // Timeout de segurança (4s)
    setTimeout(() => {
      if (!this.assets.canvas) {
        console.warn('⚠️ Canvas timeout - forçando complete');
        this.assets.canvas = true;
      }
    }, 4000);
  }

  async monitorFonts() {
    try {
      await document.fonts.ready;
      console.log('🔤 Fonts ready');
      this.assets.fonts = true;
    } catch (error) {
      console.warn('⚠️ Fonts loading error:', error);
      // Fallback após timeout
      setTimeout(() => {
        this.assets.fonts = true;
      }, 2000);
    }
  }

  async monitorImages() {
    try {
      // Importa projects dinamicamente
      const { projects } = await import('../scripts/projects.js');
      
      // Pega apenas primeiras imagens de cada projeto (hero images)
      const heroImages = projects.map(project => project.image);
      
      const imagePromises = heroImages.map(src => 
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false); // Não bloqueia por uma imagem
          img.src = src;
        })
      );

      await Promise.all(imagePromises);
      console.log('🖼️ Hero images loaded');
      this.assets.images = true;
    } catch (error) {
      console.warn('⚠️ Images loading error:', error);
      // Fallback
      setTimeout(() => {
        this.assets.images = true;
      }, 3000);
    }
  }

  calculateProgress() {
    const weights = {
      canvas: 40,  // Canvas é mais importante
      fonts: 30,   // Fontes são críticas para layout
      images: 30   // Imagens são importantes mas não bloqueantes
    };
    
    let totalProgress = 0;
    Object.keys(this.assets).forEach(asset => {
      if (this.assets[asset]) {
        totalProgress += weights[asset];
      }
    });
    
    return Math.min(totalProgress, 100);
  }

  updateProgress() {
    const checkProgress = () => {
      if (this.isComplete) return;
      
      const newProgress = this.calculateProgress();
      
      if (newProgress !== this.progress) {
        this.progress = newProgress;
        this.updateVisuals();
        
        console.log(`📊 Progress: ${this.progress}%`, this.assets);
      }
      
      // Se chegou em 100%, inicia sequência final
      if (this.progress >= 100 && !this.isComplete) {
        this.isComplete = true;
        this.startExitSequence();
        return;
      }
      
      // Continua checando
      requestAnimationFrame(checkProgress);
    };
    
    checkProgress();
  }

  updateVisuals() {
    // Calcula novo tamanho da fonte baseado no progresso
    const progressRatio = this.progress / 100;
    const currentFontSize = this.minFontSize + (this.maxFontSize - this.minFontSize) * progressRatio;
    
    // Aplica o tamanho
    if (this.loadingText && this.counter) {
      this.loadingText.style.fontSize = `${currentFontSize}rem`;
      this.counter.style.fontSize = `${currentFontSize}rem`;
    }
    
    // Atualiza counter com leading zeros
    const displayProgress = Math.floor(this.progress);
    const formattedCounter = displayProgress.toString().padStart(3, '0');
    
    if (this.counter) {
      this.counter.textContent = formattedCounter;
    }
  }

  async startExitSequence() {
    console.log('🚀 Starting preloader exit sequence');
    
    try {
      // 1. Fade out "LOADING 100"
      await this.fadeOutLoading();
      
      // 2. Fade in "WELCOME TO SPOONFUL" 
      await this.showWelcome();
      
      // 3. Aguarda 3 segundos
      await this.wait(3000);
      
      // 4. Fade out welcome
      await this.hideWelcome();
      
      // 5. Swipe up do fundo vermelho
      await this.swipeUpBackground();
      
      // 6. Dispara animação do Hero
      this.triggerHeroAnimation();
      
      // 7. LIMPEZA AGRESSIVA
      this.aggressiveCleanup();
      
    } catch (error) {
      console.error('❌ Erro na sequência de saída:', error);
      // Fallback: força remoção do preloader
      this.aggressiveCleanup();
    }
  }

  fadeOutLoading() {
    return new Promise(resolve => {
      gsap.to(this.preloaderContent, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  showWelcome() {
    return new Promise(resolve => {
      if (!this.welcomeEl) return resolve();
      
      this.welcomeEl.style.pointerEvents = 'none';
      this.welcomeEl.classList.add('preloader-welcome--visible');
      gsap.set(this.welcomeEl, { display: 'flex' });
      
      gsap.to(this.welcomeEl, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  hideWelcome() {
    return new Promise(resolve => {
      if (!this.welcomeEl) return resolve();
      
      gsap.to(this.welcomeEl, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  swipeUpBackground() {
    return new Promise(resolve => {
      // Anima ambos elementos para cima
      const elements = [this.preloader, this.welcomeEl].filter(Boolean);
      
      gsap.to(elements, {
        y: '-100%',
        duration: 0.8,
        ease: 'power2.inOut',
        stagger: 0.05,
        onComplete: resolve
      });
    });
  }

  triggerHeroAnimation() {
    console.log('🎬 Triggering hero animation');
    
    // Dispara evento para o scroll orchestrator
    window.dispatchEvent(new CustomEvent('preloader:complete'));
    
    // Se o animateHeroEntry existe globalmente, chama direto
    if (window.animateHeroEntry) {
      window.animateHeroEntry();
    }
  }

  aggressiveCleanup() {
    console.log('🧹 Starting aggressive cleanup...');
    
    // Remove elementos imediatamente
    if (this.preloader) {
      this.preloader.remove();
      this.preloader = null;
    }
    if (this.welcomeEl) {
      this.welcomeEl.remove();
      this.welcomeEl = null;
    }

    // Força limpeza de event listeners
    this.preloaderContent = null;
    this.loadingText = null;
    this.counter = null;
    this.welcomeText = null;

    // CRÍTICO: Restaura pointer events no body e elementos principais
    document.body.style.pointerEvents = '';
    
    // Restaura interactions em elementos críticos
    const criticalElements = [
      '#root', // Canvas
      '.nav-menu-container', // Nav
      '.work-track', // Portfolio cards
      '.custom-cursor' // Cursor
    ];
    
    criticalElements.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.pointerEvents = '';
        el.style.zIndex = '';
      }
    });
    
    // Força reflow para garantir que mudanças sejam aplicadas
    document.body.offsetHeight;
    
    console.log('✅ Aggressive cleanup complete');
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método para debug
  forceComplete() {
    console.log('🔧 Force completing preloader');
    this.assets.canvas = true;
    this.assets.fonts = true;
    this.assets.images = true;
  }
}

export default PreloaderManager;