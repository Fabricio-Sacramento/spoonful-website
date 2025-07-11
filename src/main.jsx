import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WhatWeDo from './components/WhatWeDo';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
ReactDOM.createRoot(document.getElementById('what-we-do-root')).render(
  <React.StrictMode>
    <WhatWeDo />
  </React.StrictMode>
);
