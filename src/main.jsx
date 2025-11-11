// src/main.jsx
import ReactDOM from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import CanvasApp from './components/CanvasApp.jsx';
import WorkSection from './components/WorkSection.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import StatementSection from './components/StatementSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import NavWithDrawer from './components/NavWithDrawer.jsx';

// Utils
import './scripts/scroll-orchestrator.js';
import canvasController from './utils/canvas-performance-controller.js';
import { setContactInteractivity } from './utils/contact-interactivity.js';
import PreloaderManager from './utils/PreloaderManager.js';

// ================================
// PRELOADER INITIALIZATION
// ================================
let preloaderManager;
let heroAnimationReady = false;

// Inicia preloader imediatamente
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Preloader Manager...');
  preloaderManager = new PreloaderManager();
});

// ================================
// MONTA COMPONENTES EXISTENTES
// (hero animation será disparada pelo preloader)
// ================================

// 1) Canvas 3D
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(<CanvasApp />);

// 2) Work Section
const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 3) Statement Section
const statementRoot = ReactDOM.createRoot(document.getElementById('statement'));
statementRoot.render(<StatementSection />);

// 4) Contact Section
const contactRoot = ReactDOM.createRoot(document.getElementById('contact'));
contactRoot.render(<ContactSection />);

// 5) Nav + Drawer
const navContainer = document.createElement('div');
document.body.appendChild(navContainer);
const navRoot = ReactDOM.createRoot(navContainer);
navRoot.render(<NavWithDrawer />);

// 6) Custom Cursor
const cursorContainer = document.createElement('div');
cursorContainer.id = 'cursor-root';
document.body.appendChild(cursorContainer);
const cursorRoot = ReactDOM.createRoot(cursorContainer);
cursorRoot.render(<CustomCursor />);

// ================================
// HERO ANIMATION COORDINATION
// ================================

// Escuta evento do preloader para disparar hero animation
window.addEventListener('preloader:complete', () => {
  console.log('🎬 Preloader complete - triggering hero animation');
  
  // Aguarda um frame para garantir que o DOM está limpo
  requestAnimationFrame(() => {
    // Dispara animação do hero se a função existir
    if (typeof window.animateHeroEntry === 'function') {
      window.animateHeroEntry();
    } else {
      console.warn('⚠️ animateHeroEntry function not found');
      // Fallback: dispara evento para o scroll orchestrator
      window.dispatchEvent(new CustomEvent('hero:start-animation'));
    }
  });
});

// ================================
// CANVAS PERFORMANCE CONTROLLER
// (delay aumentado para dar tempo ao preloader)
// ================================
window.addEventListener('load', () => {
  setTimeout(() => {
    canvasController.init(root3D, <CanvasApp />);
    console.log('Canvas Performance Controller ativo');
  }, 1200); // Aumentado de 600ms para dar tempo ao preloader
});

// ================================
// DEBUG HELPERS
// ================================
if (window.location.hash === '#debug') {
  window.debugCanvas = {
    controller: canvasController,
    kill: () => canvasController.forceKill(),
    resume: () => canvasController.forceResume(),
    status: () => canvasController.getStatus()
  };

  window.debugStatement = {
    trigger: () => {
      console.log('🧪 Debug: Disparando statement:start');
      window.dispatchEvent(new CustomEvent('statement:start'));
    },
    stop: () => {
      console.log('🧪 Debug: Disparando statement:stop');
      window.dispatchEvent(new CustomEvent('statement:stop'));
    },
    checkScrollTrigger: () => {
      const triggers = ScrollTrigger.getAll();
      const statementTrigger = triggers.find(t => 
        t.trigger?.id === 'statement'
      );
      console.log('Statement ScrollTrigger:', statementTrigger);
      return statementTrigger;
    }
  };
  
  window.debugContact = {
    enable: () => setContactInteractivity(true),
    disable: () => setContactInteractivity(false),
    checkStatus: () => {
      const layer = document.querySelector('.contact-layer');
      return {
        exists: !!layer,
        ariaHidden: layer?.getAttribute('aria-hidden'),
        pointerEvents: layer?.style.pointerEvents,
        revealed: layer?.classList.contains('contact-layer--revealed'),
        interactiveElements: layer?.querySelectorAll('a, button, input, textarea').length
      };
    }
  };
  
  window.debugCursor = {
    getState: () => {
      const cursor = document.querySelector('.custom-cursor');
      return {
        exists: !!cursor,
        visible: cursor?.style.opacity,
        position: cursor ? {
          x: cursor.style.left,
          y: cursor.style.top
        } : null
      };
    }
  };

  window.debugNav = {
    getState: () => {
      const container = document.querySelector('.nav-menu-container');
      return {
        exists: !!container,
        isOpen: container?.classList.contains('open'),
        items: document.querySelectorAll('.nav-menu-item').length,
        activeItem: document.querySelector('.nav-menu-item.active')?.textContent
      };
    }
  };
  
  // Debug para PRELOADER
  window.debugPreloader = {
    manager: () => preloaderManager,
    forceComplete: () => {
      if (preloaderManager) {
        preloaderManager.forceComplete();
      } else {
        console.warn('Preloader manager not found');
      }
    },
    getProgress: () => {
      if (preloaderManager) {
        return {
          progress: preloaderManager.progress,
          assets: preloaderManager.assets,
          isComplete: preloaderManager.isComplete
        };
      }
      return null;
    },
    triggerHero: () => {
      window.dispatchEvent(new CustomEvent('preloader:complete'));
    },
    checkAssets: () => {
      return {
        canvas: !!document.querySelector('#root canvas'),
        canvasWidth: document.querySelector('#root canvas')?.width,
        fontsReady: document.fonts.status,
        preloaderExists: !!document.getElementById('preloader')
      };
    }
  };
  
  document.body.setAttribute('data-debug', 'true');
  console.log('🔧 Debug mode ativo - use window.debugPreloader para controles');
}