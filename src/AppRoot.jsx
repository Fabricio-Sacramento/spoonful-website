// src/AppRoot.jsx - Wrapper com Preloader
import { useState } from 'react';
import Preloader from './components/Preloader.jsx';

const AppRoot = () => {
  const [showPreloader, setShowPreloader] = useState(true);
  
  return (
    <>
      {/* PRELOADER */}
      {showPreloader && (
        <Preloader 
          onComplete={() => {
            console.log('✅ Preloader complete - revealing site');
            setShowPreloader(false);
            
            // Pequeno delay pra garantir DOM atualizado
            setTimeout(() => {
              // Trigger hero animation
              const heroEvent = new CustomEvent('hero:animate-entry');
              window.dispatchEvent(heroEvent);
            }, 100);
          }}
        />
      )}
      
      {/* SITE CONTENT (carrega em background) */}
      <div style={{ 
        visibility: showPreloader ? 'hidden' : 'visible',
        opacity: showPreloader ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        {/* Conteúdo já carrega aqui */}
      </div>
    </>
  );
};

export default AppRoot;