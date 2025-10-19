// src/utils/page-state-controller.js
// Sistema unificado de gerenciamento de estado da página

import { CURSOR_STATES } from '../hooks/useCursorFSM';

class PageStateController {
  constructor() {
    this.currentSection = 'hero';
    this.mousePosition = { x: 0, y: 0 };
    this.isOverNav = false;
    this.isModalOpen = false;
    this.listeners = new Map();
    
    // Cache de elementos para performance
    this.elements = {
      navMenu: null,
      heroSection: null,
      contactLayer: null
    };
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.startDetection();
    
    console.log('📋 PageStateController initialized');
  }

  cacheElements() {
    // Cache elementos uma vez para performance
    this.elements.navMenu = document.querySelector('.nav-menu-container');
    this.elements.heroSection = document.querySelector('#hero');
    this.elements.contactLayer = document.querySelector('.contact-layer');
    
    console.log('📋 Elements cached:', {
      navMenu: !!this.elements.navMenu,
      heroSection: !!this.elements.heroSection,
      contactLayer: !!this.elements.contactLayer
    });
  }

  setupEventListeners() {
    // Mouse tracking
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Nav menu hover detection
    if (this.elements.navMenu) {
      this.elements.navMenu.addEventListener('mouseenter', this.handleNavEnter.bind(this));
      this.elements.navMenu.addEventListener('mouseleave', this.handleNavLeave.bind(this));
    }
    
    // Modal events
    window.addEventListener('modal:open', this.handleModalOpen.bind(this));
    window.addEventListener('modal:close', this.handleModalClose.bind(this));
    
    // Scroll detection
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    console.log('📋 Event listeners attached');
  }

  startDetection() {
    // Detecção inicial
    this.detectCurrentSection();
    this.notifyStateChange();
    
    // Setup IntersectionObserver para seções intermediárias
    this.setupSectionObserver();
  }

  setupSectionObserver() {
    const sectionsForIO = [
      document.getElementById('about-us'),
      document.getElementById('what-we-do'), 
      document.getElementById('work'),
      document.getElementById('statement')
    ].filter(Boolean);

    if (sectionsForIO.length === 0) return;

    const observerConfig = {
      threshold: [0, 0.5, 1],
      rootMargin: '-10% 0px -10% 0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const sectionId = entry.target.id;
          
          // Ignora se modal aberto ou mouse sobre nav
          if (this.isModalOpen || this.isOverNav) return;
          
          // Apenas atualiza se não for Hero ou Contact (que têm detecção especial)
          if (sectionId !== 'hero' && sectionId !== 'contact') {
            this.updateSection(sectionId);
          }
        }
      });
    };

    this.sectionObserver = new IntersectionObserver(handleIntersection, observerConfig);
    
    sectionsForIO.forEach(section => {
      this.sectionObserver.observe(section);
    });

    console.log('📋 Section observer setup for', sectionsForIO.length, 'sections');
  }

  // Event Handlers
  handleMouseMove(e) {
    this.mousePosition = { x: e.clientX, y: e.clientY };
  }

  handleNavEnter() {
    console.log('📋 Nav hover: ENTER');
    this.isOverNav = true;
    this.emit('nav-hover', true);
  }

  handleNavLeave() {
    console.log('📋 Nav hover: LEAVE');
    this.isOverNav = false;
    this.emit('nav-hover', false);
    
    // Re-detecta seção atual após sair do nav
    this.detectCurrentSection();
    this.notifyStateChange();
  }

  handleModalOpen() {
    console.log('📋 Modal: OPEN');
    this.isModalOpen = true;
    this.emit('modal-state', true);
  }

  handleModalClose() {
    console.log('📋 Modal: CLOSE');
    this.isModalOpen = false;
    this.emit('modal-state', false);
    
    // Re-detecta estado após modal fechar
    setTimeout(() => {
      this.detectCurrentSection();
      this.notifyStateChange();
    }, 100);
  }

  handleScroll() {
    // Throttle scroll detection
    if (this.scrollTimeout) return;
    
    this.scrollTimeout = setTimeout(() => {
      this.detectCurrentSection();
      this.notifyStateChange();
      this.scrollTimeout = null;
    }, 16); // ~60fps
  }

  // Section Detection (Inteligente)
  detectCurrentSection() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    let newSection;

    // Hero: Topo absoluto
    if (scrollY <= 50) {
      newSection = 'hero';
    }
    // Contact: Final absoluto  
    else if (scrollY >= maxScroll - 50) {
      newSection = 'contact';
    }
    // Seções intermediárias: manter valor atual se não mudou
    // (IntersectionObserver cuida das mudanças)
    else {
      newSection = this.currentSection;
    }

    return newSection;
  }

  updateSection(sectionId) {
    if (this.currentSection === sectionId) return;
    
    const previousSection = this.currentSection;
    this.currentSection = sectionId;
    
    console.log('📋 Section changed:', previousSection, '→', sectionId);
    this.notifyStateChange();
  }

  notifyStateChange() {
    const cursorState = this.getCursorState();
    
    this.emit('section-changed', {
      section: this.currentSection,
      cursorState: cursorState,
      isOverNav: this.isOverNav,
      isModalOpen: this.isModalOpen
    });
  }

  getCursorState() {
    // Prioridade: Modal > Nav > Seção
    if (this.isModalOpen) {
      return CURSOR_STATES.GREEN_DOT;
    }
    
    if (this.isOverNav) {
      return CURSOR_STATES.GREEN_DOT;
    }
    
    // Estados por seção
    switch (this.currentSection) {
      case 'hero':
        return CURSOR_STATES.DRAG_ME;
      case 'work':
        // Work tem detecção especial de hover nos cards
        return CURSOR_STATES.GREEN_DOT;
      default:
        return CURSOR_STATES.GREEN_DOT;
    }
  }

  // Event System (Pub/Sub)
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    console.log('📋 Listener added for:', event);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('📋 Error in event listener:', event, error);
      }
    });
  }

  // Public API
  getCurrentSection() {
    return this.currentSection;
  }

  getCurrentCursorState() {
    return this.getCursorState();
  }

  getMousePosition() {
    return { ...this.mousePosition };
  }

  isMouseOverNav() {
    return this.isOverNav;
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('modal:open', this.handleModalOpen);
    window.removeEventListener('modal:close', this.handleModalClose);
    
    if (this.elements.navMenu) {
      this.elements.navMenu.removeEventListener('mouseenter', this.handleNavEnter);
      this.elements.navMenu.removeEventListener('mouseleave', this.handleNavLeave);
    }
    
    // Cleanup observer
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    // Clear timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Clear listeners
    this.listeners.clear();
    
    console.log('📋 PageStateController destroyed');
  }
}

// Singleton instance
const pageStateController = new PageStateController();

export default pageStateController;