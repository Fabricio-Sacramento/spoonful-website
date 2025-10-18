// src/components/NavWithDrawer.jsx
// Wrapper que conecta NavMenu com AboutDrawer

import { useState, useEffect } from 'react';
import NavMenu from './NavMenu.jsx';
import AboutDrawer from './AboutDrawer.jsx';

const NavWithDrawer = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Escuta evento customizado do NavMenu
  useEffect(() => {
    const handleOpenAbout = () => {
      setIsAboutOpen(true);
    };

    window.addEventListener('nav:open-about-drawer', handleOpenAbout);
    
    return () => {
      window.removeEventListener('nav:open-about-drawer', handleOpenAbout);
    };
  }, []);

  return (
    <>
      <NavMenu />
      <AboutDrawer 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </>
  );
};

export default NavWithDrawer;