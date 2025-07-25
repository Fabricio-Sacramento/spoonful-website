// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import WorkSection from './components/WorkSection.jsx';

// 1) Monta o canvas 3D / cena React no #root
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2) Monta o WorkSection no container estático #work-root
const workRootEl = document.getElementById('work-root');
if (workRootEl) {
  const workRoot = ReactDOM.createRoot(workRootEl);
  workRoot.render(
    <React.StrictMode>
      <WorkSection />
    </React.StrictMode>
  );
}
