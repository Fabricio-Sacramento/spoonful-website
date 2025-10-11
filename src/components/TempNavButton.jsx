// src/components/TempNavButton.jsx
// Botão temporário para teste - base para o menu definitivo
import { useState } from 'react';
import AboutDrawer from './AboutDrawer';

const TempNavButton = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante */}
      <button 
        className="temp-nav-button"
        onClick={() => setIsAboutOpen(true)}
        aria-label="Abrir About Me"
      >
        About Me
      </button>

      {/* Drawer do About Me */}
      <AboutDrawer 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </>
  );
};

export default TempNavButton;