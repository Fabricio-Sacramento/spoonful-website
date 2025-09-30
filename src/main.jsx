// src/main.jsx
// ADICIONAR imports e montagem do StatementSection

import ReactDOM from 'react-dom/client';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CanvasApp from './components/CanvasApp.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import StatementSection from './components/StatementSection.jsx';
import canvasController from './utils/canvas-performance-controller.js';

// 1) Monta o canvas 3D inicial
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(<CanvasApp />);

// 2) Monta Work Section
const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 3) Monta Statement Section ← NOVO
const statementRoot = ReactDOM.createRoot(document.getElementById('statement'));
statementRoot.render(<StatementSection />);

// 4) Monta Custom Cursor
const cursorDiv = document.createElement('div');
cursorDiv.id = 'custom-cursor-mount';
document.body.appendChild(cursorDiv);

const cursorRoot = ReactDOM.createRoot(cursorDiv);
cursorRoot.render(<CustomCursor />);

// 5) Inicializa Canvas Performance Controller
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

  // Debug Statement ← ATUALIZADO
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