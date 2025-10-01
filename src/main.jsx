// src/main.jsx
import ReactDOM from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CanvasApp from './components/CanvasApp.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import StatementSection from './components/StatementSection.jsx';
import ContactSection from './components/ContactSection.jsx'; // ← NOVO
import canvasController from './utils/canvas-performance-controller.js';

// 1) Canvas 3D
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(<CanvasApp />);

// 2) Work Section
const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 3) Statement Section
const statementRoot = ReactDOM.createRoot(document.getElementById('statement'));
statementRoot.render(<StatementSection />);

// 4) Contact Section ← NOVO
const contactRoot = ReactDOM.createRoot(document.getElementById('contact'));
contactRoot.render(<ContactSection />);

// 5) Custom Cursor
const cursorDiv = document.createElement('div');
cursorDiv.id = 'custom-cursor-mount';
document.body.appendChild(cursorDiv);

const cursorRoot = ReactDOM.createRoot(cursorDiv);
cursorRoot.render(<CustomCursor />);

// 6) Canvas Performance Controller
window.addEventListener('load', () => {
  setTimeout(() => {
    canvasController.init(root3D, <CanvasApp />);
    console.log('Canvas Performance Controller ativo');
  }, 600);
});

// Debug helpers (mantidos)
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
}