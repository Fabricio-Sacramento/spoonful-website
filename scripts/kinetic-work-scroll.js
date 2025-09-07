/**
 * Kinetic Work Scroll - Solução Limpa e Minimalista
 * Foco: funcionalidade essencial sem over-engineering
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class KineticWorkScroll {
  constructor() {
    this.velocity = 0;
    this.position = 0;
    this.isActive = false;
    this.bounds = { min: 0, max: 0 };
    
    this.config = {
      friction: 0.92,
      sensitivity: 0.8,
      maxVelocity: 20,
      exitThreshold: 10
    };
    
    this.workSection = null;
    this.container = null;
    this.scrollTrigger = null;
    this.rafId = null;
    
    this.handleWheel = this.handleWheel.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    this.workSection = document.querySelector('#work');
    this.container = this.workSection?.querySelector('.work-track');
    
    if (!this.workSection || !this.container) {
      console.warn('Work elements not found');
      return;
    }

    // Desktop apenas - mobile usa layout padrão
    if (window.innerWidth >= 1024) {
      this.setupDesktop();
    } else {
      this.setupMobile();
    }
    
    window.addEventListener('resize', this.handleResize);
  }

  setupDesktop() {
    this.calculateBounds();
    
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top top',
      end: () => `+=${this.bounds.max + window.innerHeight * 0.3}`,
      pin: true,
      pinSpacing: true,
      
      onEnter: () => this.startKinetic(),
      onLeave: () => this.stopKinetic(),
      onEnterBack: () => this.startKinetic(),
      onLeaveBack: () => this.stopKinetic()
    });
  }

  setupMobile() {
    gsap.set(this.workSection, { height: 'auto', overflow: 'visible' });
    
    ScrollTrigger.create({
      trigger: this.workSection,
      start: 'top 80%',
      onEnter: () => {
        gsap.to('.work-card', {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1
        });
      }
    });
  }

  calculateBounds() {
    const containerWidth = this.container.scrollWidth;
    const viewportWidth = this.workSection.offsetWidth;
    this.bounds.max = Math.max(0, containerWidth - viewportWidth);
  }

  startKinetic() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.velocity = 0;
    this.position = 0;
    
    this.workSection.addEventListener('wheel', this.handleWheel, { passive: false });
    this.workSection.classList.add('kinetic-active');
    
    this.animate();
  }

  stopKinetic() {
    this.isActive = false;
    this.velocity = 0;
    
    this.workSection.removeEventListener('wheel', this.handleWheel);
    this.workSection.classList.remove('kinetic-active');
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  handleWheel(e) {
    if (!this.isActive) return;
    
    // Verifica se está nos limites e usuário quer continuar
    const atStart = this.position <= this.config.exitThreshold;
    const atEnd = this.position >= this.bounds.max - this.config.exitThreshold;
    const slowVelocity = Math.abs(this.velocity) < 1;
    
    if ((atStart && e.deltaY < 0 && slowVelocity) || 
        (atEnd && e.deltaY > 0 && slowVelocity)) {
      // Libera scroll - não previne o evento
      this.stopKinetic();
      return;
    }
    
    e.preventDefault();
    
    this.velocity += e.deltaY * this.config.sensitivity * 0.3;
    this.velocity = Math.max(-this.config.maxVelocity, 
                            Math.min(this.config.maxVelocity, this.velocity));
  }

  animate() {
    if (!this.isActive) return;
    
    // Atualiza posição
    this.position += this.velocity;
    
    // Limites com bounce
    if (this.position < this.bounds.min) {
      this.position = this.bounds.min;
      this.velocity *= -0.1;
    } else if (this.position > this.bounds.max) {
      this.position = this.bounds.max;
      this.velocity *= -0.1;
    }
    
    // Friction
    this.velocity *= this.config.friction;
    
    // Para quando muito lento
    if (Math.abs(this.velocity) < 0.1) {
      this.velocity = 0;
    }
    
    // Aplica transform
    gsap.set(this.container, {
      x: -this.position,
      force3D: true
    });
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    if (window.innerWidth >= 1024) {
      if (!this.scrollTrigger) {
        this.setupDesktop();
      } else {
        this.calculateBounds();
        ScrollTrigger.refresh();
      }
    } else {
      if (this.scrollTrigger) {
        this.destroy();
        this.setupMobile();
      }
    }
  }

  destroy() {
    this.stopKinetic();
    
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    // Reset position
    if (this.container) {
      gsap.set(this.container, { x: 0, clearProps: 'transform' });
    }
  }
}

export default KineticWorkScroll;