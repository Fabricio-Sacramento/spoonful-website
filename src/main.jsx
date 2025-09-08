// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';
import canvasController from './utils/canvas-performance-controller.js';

// 1) Monta o canvas 3D / cena React no #root
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

// 2) Inicializa Performance Controller após tudo estar montado
window.addEventListener('load', () => {
  setTimeout(() => {
    canvasController.init((state) => {
      console.log(`Canvas State: ${state}`);
    });
    console.log('Performance Controller integrado');
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
}