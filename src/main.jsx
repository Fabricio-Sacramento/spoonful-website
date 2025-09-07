// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './scripts/scroll-orchestrator.js';
import WorkSection from './components/WorkSection.jsx';


// 1) Monta o canvas 3D / cena React no #root
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const workRoot = ReactDOM.createRoot(document.getElementById('work-mount-point'));
workRoot.render(<WorkSection />);

