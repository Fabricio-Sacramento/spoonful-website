// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1) Monta o canvas 3D / cena React no #root
const root3D = ReactDOM.createRoot(document.getElementById('root'));
root3D.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


