/**
 * 🚀 Kinetic Scroll para Seção Work - VERSÃO CORRIGIDA
 * Implementação custom com GSAP + ScrollTrigger integration
 * Mantém compatibilidade total com arquitetura existente
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registra o plugin
gsap.registerPlugin(ScrollTrigger);

class KineticWorkScroll {
  constructor() {
    // Physics parameters
    this.velocity = 0;
    this.position = 0;
    this.targetPosition = 0;
    this.isKineticActive = false;
    
    // Configuration
    this.config = {
      friction: 0.92,           // Desaceleração natural
      maxVelocity: 20,          // Velocidade máxima reduzida
      bounceStiffness: 0.1,     // Bounce muito sutil
      damping: 0.8,             // Amortecimento natural
      sensitivity: 0.8,         // Sensibilidade reduzida
      velocityThreshold: 0.1    // Threshold para parar animação
    };
    
    // State management
    this.bounds = { min: 0, max: 0 };
    this.scrollTriggerInstance = null;
    this.rafId = null;
    
    // Elements
    this.workSection = null;
    this.cardsContainer = null;
    this.cards = [];
    
    // Touch handling
    this.touch = {
      startX: 0,
      lastX: 0,
      startTime: 0,
      isActive: false
    };
    
    // Performance optimization
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    console.log('🎯 KineticWorkScroll - Versão Corrigida Criada');
  }

  /**
   * Inicialização principal
   */
  init() {
    this.workSection = document.querySelector('#work');
    this.cardsContainer = this.workSection?.querySelector('.work-track');
    this.cards = Array.from(this.workSection?.querySelectorAll('.work-card') || []);
    
    if (!this.workSection || !this.cardsContainer) {
      console.warn('Work section elements not found');
      console.log('Looking for: #work and .work-track');
      console.log('Found section:', !!this.workSection);
      console.log('Found container:', !!this.cardsContainer);
      return;
    }

    this.calculateBounds();
    this.setupScrollTrigger();
    this.setupEventListeners();
    
    console.log('🚀 Kinetic Work Scroll initialized - FIXED VERSION');
  }

  /**
   * Calcula os limites do scroll horizontal
   */
  calculateBounds() {
    const containerWidth = this.cardsContainer.scrollWidth;
    const viewportWidth = this.workSection.offsetWidth;
    this.bounds.max = Math.max(0, containerWidth - viewportWidth);
    
    console.log('Scroll bounds:', this.bounds);
  }

  /**
   * Setup ScrollTrigger com integração kinetic
   */
  setupScrollTrigger() {
    // ScrollTrigger principal com configuração corrigida
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top top',
      end: () => {
        // Calcula end baseado no conteúdo a ser scrollado
        this.calculateBounds();
        // Reduz a distância para permitir saída mais fácil
        const scrollDistance = this.bounds.max + window.innerHeight * 0.3;
        console.log('📏 ScrollTrigger end distance:', scrollDistance);
        return `+=${scrollDistance}`;
      },
      pin: true,
      pinSpacing: true,
      scrub: false,
      refreshPriority: 2,
      anticipatePin: 1, // Ajuda com performance
      
      onUpdate: (self) => {
        const progress = self.progress;
        console.log('📊 ScrollTrigger progress:', progress.toFixed(3));
        
        // Se chegou muito perto do final (95%), facilita a saída
        if (progress > 0.95) {
          console.log('🚪 Preparando saída da seção...');
          this.prepareExit();
        }
      },
      
      onEnter: () => {
        console.log('🎯 Entrando na seção Work');
        this.resetState();
        setTimeout(() => this.startKineticMode(), 100);
      },
      
      onLeave: () => {
        console.log('🚪 Saindo da seção Work');
        this.stopKineticMode();
        this.resetPosition();
        this.restorePageScroll();
      },
      
      onEnterBack: () => {
        console.log('🔄 Voltando para seção Work');
        this.resetState();
        setTimeout(() => this.startKineticMode(), 100);
      },
      
      onLeaveBack: () => {
        console.log('⬅️ Saindo da seção Work (volta)');
        this.stopKineticMode();
        this.resetPosition();
        this.restorePageScroll();
      }
    });
    
    console.log('🎬 ScrollTrigger criado com configuração otimizada');
  }

  /**
   * Prepara a saída quando chegou no final
   */
  prepareExit() {
    // Reduz friction para facilitar movimento
    if (this.velocity !== 0) {
      this.velocity *= 0.5;
    }
    
    // Se está praticamente parado no final, força conclusão
    const isAtEnd = this.position >= this.bounds.max * 0.95;
    const isIdle = Math.abs(this.velocity) < 0.5;
    
    if (isAtEnd && isIdle) {
      console.log('🏁 Forçando conclusão do scroll horizontal');
      this.position = this.bounds.max;
      this.targetPosition = this.bounds.max;
      this.velocity = 0;
    }
  }

  /**
   * Restaura scroll da página
   */
  restorePageScroll() {
    document.body.style.overflow = '';
    console.log('📜 Scroll da página restaurado');
  }

  /**
   * Reset completo do estado
   */
  resetState() {
    this.velocity = 0;
    this.position = 0;
    this.targetPosition = 0;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    console.log('🔄 Estado resetado');
  }

  /**
   * Reset da posição visual
   */
  resetPosition() {
    gsap.set(this.cardsContainer, {
      x: 0,
      clearProps: "transform"
    });
    
    this.resetState();
    console.log('📍 Posição resetada');
  }

  /**
   * Ativa modo kinetic
   */
  startKineticMode() {
    if (this.reduceMotion || this.isKineticActive) return;
    
    this.isKineticActive = true;
    this.startRenderLoop();
    this.workSection.classList.add('kinetic-active');
    
    console.log('🎯 Kinetic mode activated');
  }

  /**
   * Desativa modo kinetic
   */
  stopKineticMode() {
    if (!this.isKineticActive) return;
    
    this.isKineticActive = false;
    this.velocity = 0;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.workSection.classList.remove('kinetic-active');
    console.log('🛑 Kinetic mode deactivated');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.workSection.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    this.workSection.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.workSection.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.workSection.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Handle wheel events
   */
  handleWheel(e) {
    if (!this.isKineticActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    let normalizedDelta = e.deltaY;
    if (e.deltaMode === 1) normalizedDelta *= 16;
    if (e.deltaMode === 2) normalizedDelta *= 16 * 24;
    
    const adjustedDelta = normalizedDelta * this.config.sensitivity * 0.2;
    
    this.velocity += adjustedDelta;
    this.velocity = Math.max(-this.config.maxVelocity, 
                            Math.min(this.config.maxVelocity, this.velocity));
  }

  /**
   * Touch handlers
   */
  handleTouchStart(e) {
    if (!this.isKineticActive) return;
    
    this.touch.isActive = true;
    this.touch.startX = e.touches[0].clientX;
    this.touch.lastX = this.touch.startX;
    this.touch.startTime = Date.now();
    this.velocity = 0;
  }

  handleTouchMove(e) {
    if (!this.isKineticActive || !this.touch.isActive) return;
    
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.touch.lastX;
    
    this.velocity = -deltaX * this.config.sensitivity;
    this.touch.lastX = currentX;
  }

  handleTouchEnd() {
    if (!this.isKineticActive || !this.touch.isActive) return;
    
    this.touch.isActive = false;
    
    const totalDelta = this.touch.lastX - this.touch.startX;
    const totalTime = Date.now() - this.touch.startTime;
    
    if (totalTime > 0) {
      const finalVelocity = -(totalDelta / totalTime) * 12;
      this.velocity = Math.max(-this.config.maxVelocity, 
                              Math.min(this.config.maxVelocity, finalVelocity));
    }
  }

  /**
   * Handle resize
   */
  handleResize() {
    this.calculateBounds();
    this.position = Math.max(0, Math.min(this.bounds.max, this.position));
    this.targetPosition = this.position;
  }

  /**
   * Main render loop - SEM updateScrollTriggerProgress!
   */
  startRenderLoop() {
    if (!this.isKineticActive) return;
    
    const render = () => {
      if (!this.isKineticActive) return;
      
      this.updatePhysics();
      this.updateTransform();
      // REMOVIDO COMPLETAMENTE: this.updateScrollTriggerProgress();
      
      this.rafId = requestAnimationFrame(render);
    };
    
    render();
  }

  /**
   * Atualiza física do movimento
   */
  updatePhysics() {
    this.targetPosition += this.velocity;
    
    // Bounce nos limites
    if (this.targetPosition < this.bounds.min) {
      this.targetPosition = this.bounds.min;
      this.velocity *= -this.config.bounceStiffness;
    } else if (this.targetPosition > this.bounds.max) {
      this.targetPosition = this.bounds.max;
      this.velocity *= -this.config.bounceStiffness;
    }
    
    // Aplica friction
    this.velocity *= this.config.friction;
    
    // Para quando muito lento
    if (Math.abs(this.velocity) < this.config.velocityThreshold) {
      this.velocity = 0;
    }
    
    // Smooth damping
    this.position += (this.targetPosition - this.position) * this.config.damping;
  }

  /**
   * Atualiza transform do container
   */
  updateTransform() {
    const xPos = -this.position;
    gsap.set(this.cardsContainer, {
      x: xPos,
      force3D: true
    });
  }

  /**
   * Cleanup e destroy
   */
  destroy() {
    this.stopKineticMode();
    
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    
    this.workSection?.removeEventListener('wheel', this.handleWheel);
    this.workSection?.removeEventListener('touchstart', this.handleTouchStart);
    this.workSection?.removeEventListener('touchmove', this.handleTouchMove);
    this.workSection?.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('resize', this.handleResize);
    
    console.log('🧹 Kinetic Work Scroll destroyed');
  }

  /**
   * Debug info
   */
  getDebugInfo() {
    return {
      velocity: this.velocity.toFixed(2),
      position: this.position.toFixed(2),
      targetPosition: this.targetPosition.toFixed(2),
      bounds: this.bounds,
      isActive: this.isKineticActive,
      version: 'FIXED_VERSION_2.0'
    };
  }
}

// Export para uso como módulo ES6
export default KineticWorkScroll;