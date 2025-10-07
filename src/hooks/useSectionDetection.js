// src/hooks/useSectionDetection.js
// Detecção híbrida: ScrollTrigger para seções animadas + IO para resto

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CURSOR_STATES } from './useCursorFSM';

// Mapeamento de seções para estados do cursor
const SECTION_STATE_MAP = {
  'hero': CURSOR_STATES.DRAG_ME,
  'about-us': CURSOR_STATES.GREEN_DOT,
  'what-we-do': CURSOR_STATES.GREEN_DOT,
  'work': CURSOR_STATES.GREEN_DOT,
  'statement': CURSOR_STATES.GREEN_DOT,
  'contact': CURSOR_STATES.GREEN_DOT
};

/**
 * Hook para detectar mudanças de seção
 * Usa ScrollTrigger para Hero/About (animados) + IO para resto
 * 
 * @param {Function} onSectionChange - Callback(sectionId, cursorState)
 * @param {Function} getCurrentCursorState - Função que retorna estado atual do cursor
 */
export const useSectionDetection = (onSectionChange, getCurrentCursorState) => {
  const observerRef = useRef(null);
  const activeSection = useRef('hero');
  const scrollTriggersRef = useRef([]);

  useEffect(() => {
    // Guard: detecta touch devices
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Section detection disabled - touch device');
      return;
    }

    // ==========================================
    // PARTE 1: ScrollTrigger para Hero/About
    // ==========================================
    
    const setupAnimatedSections = () => {
      const wrapper = document.querySelector('.intro-wrapper');
      
      if (!wrapper) {
        console.warn('⚠️ intro-wrapper not found - retrying...');
        return false;
      }

      // ScrollTrigger para HERO (início do scroll)
      const heroTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: '30% top', // Hero visível nos primeiros 30% do wrapper
        onEnter: () => {
          console.log('📍 Hero ENTERED (ScrollTrigger)');
          if (activeSection.current !== 'hero') {
            activeSection.current = 'hero';
            onSectionChange('hero', CURSOR_STATES.DRAG_ME);
          }
        },
        onEnterBack: () => {
          console.log('📍 Hero ENTERED BACK (ScrollTrigger)');
          if (activeSection.current !== 'hero') {
            activeSection.current = 'hero';
            onSectionChange('hero', CURSOR_STATES.DRAG_ME);
          }
        }
      });

      // ScrollTrigger para ABOUT US (meio/fim do scroll do wrapper)
      const aboutTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: '30% top', // About aparece depois de 30% do wrapper
        end: 'bottom top',
        onEnter: () => {
          console.log('📍 About Us ENTERED (ScrollTrigger)');
          
          // Ignora se VIEW está ativo
          if (getCurrentCursorState() === CURSOR_STATES.VIEW) {
            console.log('🔒 About transition blocked - VIEW priority');
            return;
          }
          
          if (activeSection.current !== 'about-us') {
            activeSection.current = 'about-us';
            onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
          }
        },
        onEnterBack: () => {
          console.log('📍 About Us ENTERED BACK (ScrollTrigger)');
          
          if (getCurrentCursorState() === CURSOR_STATES.VIEW) {
            console.log('🔒 About transition blocked - VIEW priority');
            return;
          }
          
          if (activeSection.current !== 'about-us') {
            activeSection.current = 'about-us';
            onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
          }
        }
      });

      scrollTriggersRef.current = [heroTrigger, aboutTrigger];
      console.log('✅ ScrollTrigger detection for Hero/About initialized');
      return true;
    };

    // Retry para garantir que wrapper está montado
    let retryCount = 0;
    const maxRetries = 10;
    
    const setupInterval = setInterval(() => {
      if (setupAnimatedSections() || retryCount >= maxRetries) {
        clearInterval(setupInterval);
      }
      retryCount++;
    }, 300);

    // ==========================================
    // PARTE 2: IO para seções normais (What We Do, Work, Statement, Contact)
    // ==========================================

    const sectionsForIO = [
      document.getElementById('what-we-do'),
      document.getElementById('work'),
      document.getElementById('statement'),
      document.querySelector('.contact-layer')
    ].filter(Boolean);

    if (sectionsForIO.length === 0) {
      console.warn('⚠️ No sections found for IO detection');
      return;
    }

    console.log(`🎯 Observing ${sectionsForIO.length} sections via IO:`, 
      sectionsForIO.map(s => s.id || s.className)
    );

    // Configuração otimizada do Observer
    const observerConfig = {
      threshold: [0, 0.5, 1],
      rootMargin: '-40% 0px -40% 0px' // Ajustado para trigger mais cedo
    };

    // Callback do Observer
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id || 
          (entry.target.classList.contains('contact-layer') ? 'contact' : null);
        
        if (!sectionId) return;

        // Ignora se VIEW está ativo (prioridade de hover em cards)
        const currentCursorState = getCurrentCursorState();
        if (currentCursorState === CURSOR_STATES.VIEW) {
          console.log(`🔒 Section change blocked - VIEW priority (${sectionId})`);
          return;
        }

        // Trigger quando seção atinge >50% de visibilidade
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Evita re-triggers da mesma seção
          if (activeSection.current === sectionId) return;

          activeSection.current = sectionId;
          const targetState = SECTION_STATE_MAP[sectionId];

          if (targetState) {
            console.log(`📍 Section entered (IO): ${sectionId} → ${targetState}`);
            onSectionChange(sectionId, targetState);
          }
        }
      });
    };

    // Cria observer
    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerConfig
    );

    // Observa seções normais
    sectionsForIO.forEach(section => {
      observerRef.current.observe(section);
    });

    console.log('✅ IO detection for normal sections initialized');

    // Cleanup
    return () => {
      clearInterval(setupInterval);
      
      // Limpa ScrollTriggers
      scrollTriggersRef.current.forEach(st => st.kill());
      scrollTriggersRef.current = [];
      
      // Limpa IO
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      console.log('🧹 Section detection cleaned up');
    };
  }, [onSectionChange, getCurrentCursorState]);

  return {
    activeSection: activeSection.current
  };
};

export default useSectionDetection;