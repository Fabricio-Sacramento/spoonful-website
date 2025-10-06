// src/hooks/useSectionDetection.js
// Intersection Observer otimizado para detectar seções do site

import { useEffect, useRef } from 'react';
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
 * Hook para detectar mudanças de seção usando Intersection Observer
 * Usa threshold multi-level para transições mais estáveis
 * 
 * @param {Function} onSectionChange - Callback(sectionId, cursorState)
 * @param {Function} getCurrentCursorState - Função que retorna estado atual do cursor
 */
export const useSectionDetection = (onSectionChange, getCurrentCursorState) => {
  const observerRef = useRef(null);
  const activeSection = useRef('hero');

  useEffect(() => {
    // Guard: detecta touch devices
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Section detection disabled - touch device');
      return;
    }

    // Seleciona seções a observar
    const sections = [
      document.getElementById('hero'),
      document.getElementById('about-us'),
      document.getElementById('what-we-do'),
      document.getElementById('work'),
      document.getElementById('statement'),
      document.querySelector('.contact-layer') // Contact pode estar em layer
    ].filter(Boolean); // Remove nulls

    if (sections.length === 0) {
      console.warn('⚠️ No sections found for cursor detection');
      return;
    }

    console.log(`🎯 Observing ${sections.length} sections:`, 
      sections.map(s => s.id || s.className)
    );

    // Configuração otimizada do Observer
    const observerConfig = {
      // Threshold multi-level: mais estável que single threshold
      threshold: [0, 0.5, 1],
      
      // Root margin: trigger quando centro da seção atinge centro do viewport
      rootMargin: '-50% 0px -50% 0px'
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

        // Trigger apenas quando seção atinge >50% de visibilidade
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Evita re-triggers da mesma seção
          if (activeSection.current === sectionId) return;

          activeSection.current = sectionId;
          const targetState = SECTION_STATE_MAP[sectionId];

          if (targetState) {
            console.log(`📍 Section entered: ${sectionId} → ${targetState}`);
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

    // Observa todas as seções
    sections.forEach(section => {
      observerRef.current.observe(section);
    });

    console.log('✅ Section detection initialized');

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log('🧹 Section detection cleaned up');
      }
    };
  }, [onSectionChange, getCurrentCursorState]);

  return {
    activeSection: activeSection.current
  };
};

export default useSectionDetection;