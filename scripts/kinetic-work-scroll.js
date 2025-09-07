/**
 * 🚀 Kinetic Scroll para Seção Work - VERSÃO FINAL REFINADA
 * Implementação com todos os ajustes cirúrgicos aplicados
 * Resolve todos os edge cases e problemas de lifecycle
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class KineticWorkScroll {
  constructor() {
    // Estados da máquina de estados
    this.states = {
      IDLE: 'idle',
      ENTERING: 'entering', 
      ACTIVE: 'active',
      EXITING: 'exiting'
    };
    
    this.currentState = this.states.IDLE;
    
    // Physics parameters
    this.velocity = 0;
    this.position = 0;
    this.targetPosition = 0;
    this.currentCardIndex = 0;
    
    // Configuration otimizada
    this.config = {
      friction: 0.92,
      maxVelocity: 18,
      bounceStiffness: 0.08,
      damping: 0.85,
      sensitivity: 0.6,
      velocityThreshold: 0.1,
      boundaryThreshold: 3, // reduzido para liberação mais natural
      exitScrollBuffer: 300 // corredor maior para facilitar saída
    };
    
    // State management
    this.bounds = { min: 0, max: 0 };
    this.scrollTriggerInstance = null;
    this.rafId = null;
    this.isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    
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
    
    // Observers para cleanup
    this.cardObserver = null;
    
    // Bound handlers para attach/detach consistente
    this.handleWheelThrottled = this.throttle(this.handleWheel.bind(this), 16);
    this.handleResizeDebounced = this.debounce(this.handleResize.bind(this), 250);
    this.handleKeydownBound = this.handleKeydown.bind(this);
    this.handleTouchStartBound = this.handleTouchStart.bind(this);
    this.handleTouchMoveBound = this.handleTouchMove.bind(this);
    this.handleTouchEndBound = this.handleTouchEnd.bind(this);
    
    // Performance monitoring (dev only)
    this.performanceMonitor = {
      frameCount: 0,
      lastTime: performance.now(),
      enabled: import.meta.env.DEV === true
    };
    
    console.log('🎯 KineticWorkScroll - Versão Final Refinada Criada');
  }

  /**
   * Inicialização com matchMedia para desktop/mobile
   */
  init() {
    this.workSection = document.querySelector('#work');
    this.cardsContainer = this.workSection?.querySelector('.work-track');
    this.cards = Array.from(this.workSection?.querySelectorAll('.work-card') || []);
    
    if (!this.workSection || !this.cardsContainer) {
      console.warn('Work section elements not found');
      return;
    }

    // Configuração responsiva usando matchMedia
    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": () => {
        this.setupDesktop();
      },
      "(max-width: 1023px)": () => {
        this.setupMobile();
      }
    });
    
    console.log('🚀 Kinetic Work Scroll initialized - FINAL REFINED VERSION');
  }

  /**
   * Configuração para desktop
   */
  setupDesktop() {
    if (this.reduceMotion) {
      this.setupReducedMotion();
      return;
    }
    
    this.calculateBounds();
    this.setupScrollTrigger();
    // Não anexa listeners aqui - serão anexados apenas quando ACTIVE
    
    console.log('💻 Desktop kinetic scroll configurado');
  }

  /**
   * Configuração para mobile (sem kinetic)
   */
  setupMobile() {
    // Remove height fixa e overflow hidden para permitir scroll vertical
    gsap.set(this.workSection, {
      height: 'auto',
      overflow: 'visible'
    });
    
    // ScrollTrigger simples sem pin para mobile
    ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => this.animateCardsIn(),
      onLeave: () => console.log('Mobile: saindo da seção Work'),
    });
    
    console.log('📱 Mobile layout configurado (sem kinetic)');
  }

  /**
   * Configuração para usuários com motion reduzido
   */
  setupReducedMotion() {
    // ScrollTrigger simples sem pin
    ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top 80%', 
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(this.cards, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }
    });
    
    console.log('♿ Modo reduzido de movimento configurado');
  }

  /**
   * Animação de entrada dos cards no mobile com cleanup adequado
   */
  animateCardsIn() {
    // Desconecta observer anterior se existir
    if (this.cardObserver) {
      this.cardObserver.disconnect();
    }
    
    this.cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
          this.cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    this.cards.forEach(card => {
      gsap.set(card, { autoAlpha: 0, y: 30 });
      this.cardObserver.observe(card);
    });
  }

  /**
   * Calcula os limites do scroll horizontal considerando padding
   */
  calculateBounds() {
    const containerWidth = this.cardsContainer.scrollWidth;
    const viewportWidth = this.workSection.clientWidth; // clientWidth mais estável
    
    // Considera padding do container para alinhamento perfeito
    const style = window.getComputedStyle(this.cardsContainer);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const effectiveScrollWidth = containerWidth - padLeft - padRight;
    
    this.bounds.max = Math.max(0, effectiveScrollWidth - viewportWidth + padLeft);
    
    console.log('Scroll bounds calculados:', {
      max: this.bounds.max,
      containerWidth,
      viewportWidth,
      padding: { left: padLeft, right: padRight }
    });
  }

  /**
   * Obtém o gap real do CSS
   */
  getGapPx() {
    const style = window.getComputedStyle(this.cardsContainer);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    return gap;
  }

  /**
   * Setup ScrollTrigger para desktop com lógica de reset corrigida
   */
  setupScrollTrigger() {
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top top',
      end: () => {
        this.calculateBounds();
        const scrollDistance = this.bounds.max + this.config.exitScrollBuffer;
        console.log('📏 ScrollTrigger end distance:', scrollDistance);
        return `+=${scrollDistance}`;
      },
      pin: true,
      pinSpacing: true,
      scrub: false,
      refreshPriority: 2,
      anticipatePin: 1,
      
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Preparar saída quando muito próximo do fim (evita re-entrada)
        if (
          progress > 0.97 &&
          (this.currentState === this.states.ACTIVE || this.currentState === this.states.EXITING)
        ) {
          this.forceLeaveForward();
        }
      },
      
      onEnter: () => {
        console.log('🎯 Entrando na seção Work');
        this.transitionTo(this.states.ENTERING);
      },
      
      onLeave: () => {
        console.log('🚪 Saindo da seção Work (forward)');
        this.transitionTo(this.states.IDLE);
        // NÃO reseta posição ao sair para frente - mantém último card visível
      },
      
      onEnterBack: () => {
        console.log('🔄 Voltando para seção Work');
        this.resetPosition(); // Reseta ANTES de reentrar
        this.transitionTo(this.states.ENTERING);
      },
      
      onLeaveBack: () => {
        console.log('⬅️ Saindo da seção Work (backward)');
        this.transitionTo(this.states.IDLE);
        this.resetPosition(); // Reseta ao sair para trás
      }
    });
  }

  /**
   * Máquina de estados para controle explícito
   */
  transitionTo(newState) {
    if (this.currentState === newState) return;
    
    console.log(`State: ${this.currentState} → ${newState}`);
    this.currentState = newState;
    
    this.handleStateChange(newState);
  }

  /**
   * Gerencia mudanças de estado
   */
  handleStateChange(newState) {
    switch(newState) {
      case this.states.ENTERING:
        this.resetState();
        // Ativação imediata - sem setTimeout
        this.transitionTo(this.states.ACTIVE);
        break;
        
      case this.states.ACTIVE:
        this.startKineticMode();
        break;
        
      case this.states.EXITING:
        this.prepareExit();
        break;
        
      case this.states.IDLE:
        this.stopKineticMode();
        break;
    }
  }

  /**
   * Reset completo do estado
   */
  resetState() {
    this.velocity = 0;
    this.position = 0;
    this.targetPosition = 0;
    this.currentCardIndex = 0;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Ativa modo kinetic e anexa listeners
   */
  startKineticMode() {
    if (this.currentState !== this.states.ACTIVE) return;
    
    this.attachListeners(); // Anexa listeners apenas quando ativo
    this.startRenderLoop();
    this.workSection.classList.add('kinetic-active');
    
    console.log('🎯 Kinetic mode activated');
  }

  /**
   * Desativa modo kinetic e remove listeners
   */
  stopKineticMode() {
    this.velocity = 0;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.detachListeners(); // Remove listeners ao desativar
    this.workSection.classList.remove('kinetic-active');
    console.log('🛑 Kinetic mode deactivated');
  }

  /**
+   * Empurra programaticamente além do end do ScrollTrigger para garantir onLeave
+   * (escape hatch contra travas por falta de delta vertical suficiente)
+   */
  forceLeaveForward() {
    // Para interceptação imediatamente
    this.stopKineticMode();
    this.currentState = this.states.IDLE;

    if (this.scrollTriggerInstance) {
      const end = this.scrollTriggerInstance.end; // px absolutos do scroller (window)
      // Nudge no frame seguinte para não conflitar com o wheel atual
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        if (y < end - 1) {
          window.scrollTo({ top: end + 2, behavior: 'auto' });
        } else {
          // Mesmo colado no end, 1px garante disparo do onLeave
          window.scrollBy({ top: 1, left: 0, behavior: 'auto' });
        }
      });
    }
  }

  /**
   * Anexa event listeners (apenas quando ACTIVE)
   */
  attachListeners() {
    if (!this.workSection) return;
    
    this.workSection.addEventListener('wheel', this.handleWheelThrottled, { passive: false });
    this.workSection.addEventListener('touchstart', this.handleTouchStartBound, { passive: true });
    this.workSection.addEventListener('touchmove', this.handleTouchMoveBound, { passive: false });
    this.workSection.addEventListener('touchend', this.handleTouchEndBound, { passive: true });
    window.addEventListener('keydown', this.handleKeydownBound);
    window.addEventListener('resize', this.handleResizeDebounced);
    
    console.log('📎 Event listeners anexados');
  }

  /**
   * Remove event listeners
   */
  detachListeners() {
    if (this.workSection) {
      this.workSection.removeEventListener('wheel', this.handleWheelThrottled);
      this.workSection.removeEventListener('touchstart', this.handleTouchStartBound);
      this.workSection.removeEventListener('touchmove', this.handleTouchMoveBound);
      this.workSection.removeEventListener('touchend', this.handleTouchEndBound);
    }
    
    window.removeEventListener('keydown', this.handleKeydownBound);
    window.removeEventListener('resize', this.handleResizeDebounced);
    
    console.log('✂️ Event listeners removidos');
  }

  /**
   * Prepara saída quando chegou próximo do fim
   */
  prepareExit() {
    console.log('🚪 Preparando saída...');
    
    // Reduz velocidade para facilitar transição
    this.velocity *= 0.3;
    
    // Se praticamente parado no final, força conclusão
    const isNearEnd = this.position >= this.bounds.max * 0.95;
    const isIdle = Math.abs(this.velocity) < 1;
    
    if (isNearEnd && isIdle) {
      console.log('🏁 Forçando conclusão do scroll horizontal');
      this.position = this.bounds.max;
      this.targetPosition = this.bounds.max;
      this.velocity = 0;
    }
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
   * Handle wheel events com detecção de limites refinada
   */
  handleWheel(e) {
    if (this.currentState !== this.states.ACTIVE) return;
    
    // Threshold adaptativo
    const threshold = Math.max(2, Math.min(24, this.config.boundaryThreshold));
    const atEnd = this.position >= (this.bounds.max - threshold);
    const atStart = this.position <= threshold;
    const lowVelocity = Math.abs(this.velocity) < 0.8; // mais permissivo
    
    // Liberar scroll se no limite E velocidade baixa E usuário continua rolando
    if ((atEnd && e.deltaY > 0 && lowVelocity) ||
        (atStart && e.deltaY < 0 && lowVelocity)) {
      console.log('🚪 Liberando scroll vertical nos limites');
      this.stopKineticMode(); // Para imediatamente e remove interceptação
      // Não chama preventDefault() - deixa o evento passar
      this.forceLeaveForward(); // garante cruzar o end e disparar onLeave
      // Não chama preventDefault() - deixa o evento passar
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    let normalizedDelta = e.deltaY;
    if (e.deltaMode === 1) normalizedDelta *= 16;
    if (e.deltaMode === 2) normalizedDelta *= 16 * 24;
    
    const adjustedDelta = normalizedDelta * this.config.sensitivity * 0.3;
    
    this.velocity += adjustedDelta;
    this.velocity = Math.max(-this.config.maxVelocity, 
                            Math.min(this.config.maxVelocity, this.velocity));
  }

  /**
   * Navegação por teclado para acessibilidade
   */
  handleKeydown(e) {
    if (this.currentState !== this.states.ACTIVE) return;
    
    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.navigateToCard(this.currentCardIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.navigateToCard(this.currentCardIndex - 1);
        break;
      case 'Escape':
        e.preventDefault();
        this.stopKineticMode();
        break;
      case 'Home':
        e.preventDefault();
        this.navigateToCard(0);
        break;
      case 'End':
        e.preventDefault();
        this.navigateToCard(this.cards.length - 1);
        break;
    }
  }

  /**
   * Navega para um card específico usando gap real
   */
  navigateToCard(index) {
    const clampedIndex = Math.max(0, Math.min(this.cards.length - 1, index));
    this.currentCardIndex = clampedIndex;
    
    // Calcula posição baseada no card com gap real
    const cardWidth = this.cards[0]?.offsetWidth || 400;
    const gap = this.getGapPx();
    const targetPosition = clampedIndex * (cardWidth + gap);
    
    // Anima suavemente para a posição
    gsap.to(this, {
      position: Math.min(targetPosition, this.bounds.max),
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        this.targetPosition = this.position;
        this.updateTransform();
      }
    });
    
    console.log(`Navegando para card ${clampedIndex} (gap: ${gap}px)`);
  }

  /**
   * Touch handlers com verificação de limites
   */
  handleTouchStart(e) {
    if (this.currentState !== this.states.ACTIVE) return;
    
    this.touch.isActive = true;
    this.touch.startX = e.touches[0].clientX;
    this.touch.lastX = this.touch.startX;
    this.touch.startTime = Date.now();
    this.velocity = 0;
  }

  handleTouchMove(e) {
    if (this.currentState !== this.states.ACTIVE || !this.touch.isActive) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.touch.lastX;
    
    // Verificar limites também no touch
    const threshold = Math.max(2, Math.min(24, this.config.boundaryThreshold));
    const atEnd = this.position >= (this.bounds.max - threshold);
    const atStart = this.position <= threshold;
    
    // Se no limite e tentando continuar, libera scroll
    if ((atEnd && deltaX < 0) || (atStart && deltaX > 0)) {
      this.touch.isActive = false;
      this.forceLeaveForward();
      return; // Não previne default, permite scroll nativo
    }
    
    e.preventDefault();
    this.velocity = -deltaX * this.config.sensitivity;
    this.touch.lastX = currentX;
  }

  handleTouchEnd() {
    if (this.currentState !== this.states.ACTIVE || !this.touch.isActive) return;
    
    this.touch.isActive = false;
    
    const totalDelta = this.touch.lastX - this.touch.startX;
    const totalTime = Date.now() - this.touch.startTime;
    
    if (totalTime > 0) {
      const finalVelocity = -(totalDelta / totalTime) * 10;
      this.velocity = Math.max(-this.config.maxVelocity, 
                              Math.min(this.config.maxVelocity, finalVelocity));
    }
  }

  /**
   * Handle resize com debounce
   */
  handleResize() {
    this.calculateBounds();
    this.position = Math.max(0, Math.min(this.bounds.max, this.position));
    this.targetPosition = this.position;
    
    // Atualiza ScrollTrigger após resize
    if (this.scrollTriggerInstance) {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Main render loop com monitor de performance (dev)
   */
  startRenderLoop() {
    if (this.currentState !== this.states.ACTIVE) return;
    
    const render = () => {
      if (this.currentState !== this.states.ACTIVE) return;
      
      // Performance monitoring (dev only)
      if (this.performanceMonitor.enabled) {
        this.performanceMonitor.frameCount++;
        const now = performance.now();
        if (now - this.performanceMonitor.lastTime >= 1000) {
          console.log(`FPS: ${this.performanceMonitor.frameCount}`);
          this.performanceMonitor.frameCount = 0;
          this.performanceMonitor.lastTime = now;
        }
      }
      
      this.updatePhysics();
      this.updateTransform();
      this.updateCardIndex();
      
      this.rafId = requestAnimationFrame(render);
    };
    
    render();
  }

  /**
   * Atualiza física do movimento
   */
  updatePhysics() {
    this.targetPosition += this.velocity;
    
    // Bounce nos limites com amortecimento
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
      force3D: true,
      willChange: 'transform'
    });
  }

  /**
   * Atualiza índice do card atual usando gap real
   */
  updateCardIndex() {
    if (this.cards.length === 0) return;
    
    const cardWidth = this.cards[0]?.offsetWidth || 400;
    const gap = this.getGapPx();
    const newIndex = Math.round(this.position / (cardWidth + gap));
    
    // Clamp index to valid range
    this.currentCardIndex = Math.max(0, Math.min(this.cards.length - 1, newIndex));
  }

  /**
   * Throttle utility
   */
  throttle(func, delay) {
    let lastCall = 0;
    let scheduled = false;
    
    return (...args) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      } else if (!scheduled) {
        scheduled = true;
        setTimeout(() => {
          scheduled = false;
          lastCall = Date.now();
          func(...args);
        }, delay - (now - lastCall));
      }
    };
  }

  /**
   * Debounce utility
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Cleanup completo com prevenção de memory leaks
   */
  destroy() {
    console.log('🧹 Iniciando cleanup do Kinetic Work Scroll...');
    
    // Para o modo kinetic primeiro (que remove listeners)
    if (this.currentState === this.states.ACTIVE) {
      this.stopKineticMode();
    }
    
    // Cancelar RAFs pendentes
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Desconectar observers
    if (this.cardObserver) {
      this.cardObserver.disconnect();
      this.cardObserver = null;
    }
    
    // Garantir remoção de listeners (caso não tenha sido feito)
    this.detachListeners();
    
    // Kill ScrollTriggers
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }
    
    // Limpar classes
    if (this.workSection) {
      this.workSection.classList.remove('kinetic-active');
    }
    
    // Limpar referências DOM
    this.workSection = null;
    this.cardsContainer = null;
    this.cards = null;
    
    // Reset estado
    this.currentState = this.states.IDLE;
    
    console.log('✅ Kinetic Work Scroll completamente destruído');
  }

  /**
   * Debug info aprimorado
   */
  getDebugInfo() {
    return {
      state: this.currentState,
      velocity: this.velocity.toFixed(2),
      position: this.position.toFixed(2),
      targetPosition: this.targetPosition.toFixed(2),
      currentCard: this.currentCardIndex,
      totalCards: this.cards.length,
      bounds: this.bounds,
      gap: this.getGapPx(),
      isDesktop: this.isDesktop,
      reduceMotion: this.reduceMotion,
      rafActive: !!this.rafId,
      scrollTriggerActive: !!this.scrollTriggerInstance,
      version: 'FINAL_REFINED_4.0'
    };
  }
}

// Singleton pattern para evitar múltiplas instâncias em HMR
let instance = null;

export function initKineticWorkScroll() {
  // Cleanup instância anterior se existir (útil para HMR)
  if (instance) {
    instance.destroy();
    instance = null;
  }
  
  // Verifica se já existe instância global (redundância para HMR)
  if (window.workKineticInstance) {
    window.workKineticInstance.destroy();
    window.workKineticInstance = null;
  }
  
  instance = new KineticWorkScroll();
  instance.init();
  
  // Guarda referência global
  window.workKineticInstance = instance;
  
  // Expor para debug em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('Debug: window.workKineticInstance disponível');
  }
  
  return instance;
}

// Auto-cleanup em HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}

export default KineticWorkScroll;