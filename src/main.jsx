// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import WorkSection from './components/WorkSection';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('work-root')).render(
  <React.StrictMode>
    <WorkSection />
  </React.StrictMode>
);
