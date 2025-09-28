// src/main.jsx
import ReactDOM from 'react-dom/client';
import CanvasApp from './components/CanvasApp.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import canvasController from './utils/canvas-performance-controller.js';

// 1) Monta o canvas 3D inicial
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(<CanvasApp />);

// 2) Monta Work Section (não afetada)
const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 3) Monta Custom Cursor em container próprio
const cursorDiv = document.createElement('div');
cursorDiv.id = 'custom-cursor-mount';
document.body.appendChild(cursorDiv);

const cursorRoot = ReactDOM.createRoot(cursorDiv);
cursorRoot.render(<CustomCursor />);

// 4) Inicializa Canvas Performance Controller
window.addEventListener('load', () => {
  setTimeout(() => {
    // Passa referências para o controller
    canvasController.init(root3D, <CanvasApp />);
    console.log('Canvas Performance Controller ativo');
  }, 600); // Aguarda GSAP setup
});

// Debug helpers - mantendo API original
if (window.location.hash === '#debug') {
  window.debugCanvas = {
    controller: canvasController,
    kill: () => canvasController.forceKill(),
    resume: () => canvasController.forceResume(),
    status: () => canvasController.getStatus()
  };
}