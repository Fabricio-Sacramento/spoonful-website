// src/hooks/useSectionDetection.js
// CORREÇÃO: Cursor deve mudar para GREEN_DOT no hover do nav menu

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CURSOR_STATES } from './useCursorFSM';

const SECTION_STATE_MAP = {
  'hero': CURSOR_STATES.DRAG_ME,
  'about-us': CURSOR_STATES.GREEN_DOT,
  'what-we-do': CURSOR_STATES.GREEN_DOT,
  'work': CURSOR_STATES.GREEN_DOT,
  'statement': CURSOR_STATES.GREEN_DOT,
  'contact': CURSOR_STATES.GREEN_DOT
};

export const useSectionDetection = (onSectionChange, getCurrentCursorState) => {
  const observerRef = useRef(null);
  const activeSection = useRef('hero');
  const scrollTriggersRef = useRef([]);
  const isOverNavRef = useRef(false); // ✅ NOVO: Track hover no nav

  useEffect(() => {
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      return;
    }

    // ✅ NOVO: Nav menu hover detection + navegação programática
    const setupNavHoverDetection = () => {
      const navMenu = document.querySelector('.nav-menu-container');
      
      if (!navMenu) {
        console.warn('⚠️ Nav menu não encontrado para hover detection');
        return false;
      }

      const handleNavEnter = () => {
        isOverNavRef.current = true;
        
        // Força GREEN_DOT independente da seção atual
        onSectionChange('nav-hover', CURSOR_STATES.GREEN_DOT);
      };

      const handleNavLeave = () => {
        isOverNavRef.current = false;
        
        // ✅ DELAY: Aguarda navegação programática completar antes de detectar seção
        setTimeout(() => {
          if (!isOverNavRef.current) { // Confirma que ainda não estamos sobre nav
            const currentSection = activeSection.current;
            const targetState = SECTION_STATE_MAP[currentSection] || CURSOR_STATES.GREEN_DOT;
            
            onSectionChange(currentSection, targetState);
          }
        }, 100); // 100ms delay para aguardar scroll/navegação
      };

      // ✅ NOVO: Listener para navegação programática via menu
      const handleProgrammaticNavigation = (event) => {
        const { targetSection } = event.detail || {};
        if (targetSection) {
          
          // Atualiza seção ativa imediatamente
          activeSection.current = targetSection;
          
          // Se não estivermos sobre nav, atualiza cursor também
          if (!isOverNavRef.current) {
            const targetState = SECTION_STATE_MAP[targetSection] || CURSOR_STATES.GREEN_DOT;
            setTimeout(() => {
              onSectionChange(targetSection, targetState);
            }, 200); // Delay maior para aguardar scroll completar
          }
        }
      };

      navMenu.addEventListener('mouseenter', handleNavEnter);
      navMenu.addEventListener('mouseleave', handleNavLeave);
      window.addEventListener('nav:programmatic-navigation', handleProgrammaticNavigation);

      
      return () => {
        navMenu.removeEventListener('mouseenter', handleNavEnter);
        navMenu.removeEventListener('mouseleave', handleNavLeave);
        window.removeEventListener('nav:programmatic-navigation', handleProgrammaticNavigation);
      };
    };

    const setupAnimatedSections = () => {
      const heroSection = document.querySelector('#hero');
      const aboutSection = document.querySelector('#about-us');
      
      if (!heroSection || !aboutSection) {
        console.warn('⚠️ Hero or About section not found');
        return false;
      }

      // HERO: Trigger explícito na própria seção
      const heroTrigger = ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        
        onEnter: () => {
          if (activeSection.current === 'hero') return;
          activeSection.current = 'hero';
          
          // ✅ CRÍTICO: Só muda cursor se não estivermos sobre o nav
          if (!isOverNavRef.current) {
            onSectionChange('hero', CURSOR_STATES.DRAG_ME);
          }
        },
        
        onEnterBack: () => {
          if (activeSection.current === 'hero') return;
          activeSection.current = 'hero';
          
          // ✅ CRÍTICO: Só muda cursor se não estivermos sobre o nav
          if (!isOverNavRef.current) {
            onSectionChange('hero', CURSOR_STATES.DRAG_ME);
          }
        },
        
        onLeave: () => {
        }
      });

      // ABOUT-US: Trigger explícito na própria seção
      const aboutTrigger = ScrollTrigger.create({
        trigger: aboutSection,
        start: 'top top',
        end: 'bottom top',
        
        onEnter: () => {
          // Bloqueia se VIEW (modal/card hover) OU se sobre nav
          if (getCurrentCursorState() === CURSOR_STATES.VIEW || isOverNavRef.current) {
            return;
          }
          if (activeSection.current === 'about-us') return;
          activeSection.current = 'about-us';
          onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
        },
        
        onEnterBack: () => {
          if (getCurrentCursorState() === CURSOR_STATES.VIEW || isOverNavRef.current) return;
          if (activeSection.current === 'about-us') return;
          activeSection.current = 'about-us';
          onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
        },
        
        onLeave: () => {
        },
        
        onLeaveBack: () => {
        }
      });

      scrollTriggersRef.current = [heroTrigger, aboutTrigger];
      return true;
    };

    // Setup nav hover primeiro
    const navCleanup = setupNavHoverDetection();
    
    // Setup seções animadas
    let retryCount = 0;
    const maxRetries = 10;
    
    const setupInterval = setInterval(() => {
      if (setupAnimatedSections() || retryCount >= maxRetries) {
        clearInterval(setupInterval);
      }
      retryCount++;
    }, 300);

    // IntersectionObserver para seções normais
    const sectionsForIO = [
      document.getElementById('what-we-do'),
      document.getElementById('work'),
      document.getElementById('statement'),
      document.querySelector('.contact-layer')
    ].filter(Boolean);

    if (sectionsForIO.length > 0) {
    }

    const observerConfig = {
      threshold: [0, 0.5, 1],
      rootMargin: '-10% 0px -10% 0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id || 
          (entry.target.classList.contains('contact-layer') ? 'contact' : null);
        
        if (!sectionId) return;

        // ✅ NOVO: Bloqueia se VIEW, modal ou hover no nav
        if (getCurrentCursorState() === CURSOR_STATES.VIEW || isOverNavRef.current) {
          return;
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (activeSection.current === sectionId) return;

          activeSection.current = sectionId;
          const targetState = SECTION_STATE_MAP[sectionId];

          if (targetState) {
            onSectionChange(sectionId, targetState);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerConfig
    );

    sectionsForIO.forEach(section => {
      observerRef.current.observe(section);
    });


    return () => {
      clearInterval(setupInterval);
      scrollTriggersRef.current.forEach(st => st.kill());
      scrollTriggersRef.current = [];
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (navCleanup) {
        navCleanup();
      }
    };
  }, [onSectionChange, getCurrentCursorState]);

  return {
    activeSection: activeSection.current
  };
};

export default useSectionDetection;