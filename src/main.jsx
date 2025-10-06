// src/main.jsx
import ReactDOM from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CanvasApp from './components/CanvasApp.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';
import CustomCursor from './components/CustomCursor.jsx'; // ← ADICIONAR
import StatementSection from './components/StatementSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import canvasController from './utils/canvas-performance-controller.js';
import { setContactInteractivity } from './utils/contact-interactivity.js';

// 1) Monta o canvas 3D inicial
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(<CanvasApp />);

// 2) Monta Work Section
const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 3) Monta Statement Section
const statementRoot = ReactDOM.createRoot(document.getElementById('statement'));
statementRoot.render(<StatementSection />);

// 4) Monta Contact Section
const contactRoot = ReactDOM.createRoot(document.getElementById('contact'));
contactRoot.render(<ContactSection />);

// 5) Monta Custom Cursor ← NOVO
const cursorContainer = document.createElement('div');
cursorContainer.id = 'cursor-root';
document.body.appendChild(cursorContainer);
const cursorRoot = ReactDOM.createRoot(cursorContainer);
cursorRoot.render(<CustomCursor />);

// 6) Inicializa Canvas Performance Controller
window.addEventListener('load', () => {
  setTimeout(() => {
    canvasController.init(root3D, <CanvasApp />);
    console.log('Canvas Performance Controller ativo');
  }, 600);
});

// Debug helpers
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
    enable: () => {
      setContactInteractivity(true);
    },
    disable: () => {
      setContactInteractivity(false);
    },
    checkStatus: () => {
      const layer = document.querySelector('.contact-layer');
      return {
        exists: !!layer,
        ariaHidden: layer?.getAttribute('aria-hidden'),
        pointerEvents: layer?.style.pointerEvents,
        revealed: layer?.classList.contains('contact-layer--revealed'),
        interactiveElements: layer?.querySelectorAll('a, button, input, textarea').length
      };
    },
    checkScrollTrigger: () => {
      const triggers = ScrollTrigger.getAll();
      const contactTrigger = triggers.find(t => 
        t.vars?.trigger?.classList?.contains('statement-contact-wrapper')
      );
      console.log('Contact ScrollTrigger:', contactTrigger);
      return contactTrigger;
    }
  };
  
  // Debug Custom Cursor ← NOVO
  window.debugCursor = {
    getState: () => {
      const cursor = document.querySelector('.custom-cursor');
      return {
        exists: !!cursor,
        visible: cursor?.style.opacity,
        position: cursor ? {
          x: cursor.style.left,
          y: cursor.style.top
        } : null,
        scale: getComputedStyle(cursor)?.getPropertyValue('--cursor-scale')
      };
    },
    enable: () => {
      document.body.removeAttribute('data-cursor-disabled');
    },
    disable: () => {
      document.body.setAttribute('data-cursor-disabled', 'true');
    }
  };
  
  // Ativa border debug visual
  document.body.setAttribute('data-debug', 'true');
}