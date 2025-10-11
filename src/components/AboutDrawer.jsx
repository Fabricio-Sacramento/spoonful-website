// src/components/AboutDrawer.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import PropTypes from 'prop-types';
import AboutSection from './AboutSection';

const AboutDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    if (isOpen) {
      // Congela scroll da página principal
      document.body.style.overflow = 'hidden';
      
      // Animação de entrada
      const tl = gsap.timeline();
      
      tl.set([overlayRef.current, drawerRef.current], { 
        display: 'flex' 
      })
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      }, 0)
      .fromTo(drawerRef.current,
        { x: '100%' },
        { 
          x: '0%',
          duration: 0.6,
          ease: 'power3.out'
        },
        0.1
      );

    } else {
      // Animação de saída
      const tl = gsap.timeline({
        onComplete: () => {
          // Libera scroll da página principal
          document.body.style.overflow = '';
        }
      });
      
      tl.to(drawerRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'power3.in'
      }, 0)
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, 0.2)
      .set([overlayRef.current, drawerRef.current], { 
        display: 'none' 
      });
    }
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div 
        ref={overlayRef}
        className="about-drawer-overlay"
        onClick={handleOverlayClick}
      />

      {/* Drawer lateral */}
      <div ref={drawerRef} className="about-drawer">
        {/* Botão fechar */}
        <button 
          onClick={onClose}
          className="about-drawer-close"
          aria-label="Fechar About Me"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Conteúdo About */}
        <div className="about-drawer-content">
          <AboutSection />
        </div>
      </div>
    </>
  );
};

AboutDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AboutDrawer;