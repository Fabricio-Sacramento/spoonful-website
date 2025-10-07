// src/hooks/useCardHover.js
// CORRIGIDO: Detecção robusta de entrada/saída de cards

import { useEffect, useCallback, useRef } from 'react';

export const useCardHover = (onCardHover) => {
  const hoveredCardRef = useRef(null);
  const isHoveringRef = useRef(false);

  const handleMouseOver = useCallback((e) => {
    const card = e.target.closest('[data-cursor="view"]');
    
    if (card && !isHoveringRef.current) {
      hoveredCardRef.current = card;
      isHoveringRef.current = true;
      console.log('🎯 Card hover START');
      onCardHover(true);
    }
  }, [onCardHover]);

  const handleMouseOut = useCallback((e) => {
    // ✅ CORRIGIDO: Checa se realmente saiu do card
    const card = e.target.closest('[data-cursor="view"]');
    const relatedTarget = e.relatedTarget;
    
    // Se hoveredCard existe E (não há card OU relatedTarget não está dentro do card)
    if (hoveredCardRef.current && (!card || !hoveredCardRef.current.contains(relatedTarget))) {
      console.log('👋 Card hover END');
      hoveredCardRef.current = null;
      isHoveringRef.current = false;
      onCardHover(false);
    }
  }, [onCardHover]);

  useEffect(() => {
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Card hover disabled');
      return;
    }

    const checkWorkSection = () => {
      const workSection = document.getElementById('work');
      
      if (!workSection) {
        console.log('⏳ Waiting for Work section...');
        return false;
      }

      workSection.addEventListener('mouseover', handleMouseOver);
      workSection.addEventListener('mouseout', handleMouseOut);
      
      console.log('✅ Card hover detection initialized');
      return true;
    };

    let retryCount = 0;
    const maxRetries = 10;
    
    const initInterval = setInterval(() => {
      if (checkWorkSection() || retryCount >= maxRetries) {
        clearInterval(initInterval);
      }
      retryCount++;
    }, 300);

    return () => {
      clearInterval(initInterval);
      
      const workSection = document.getElementById('work');
      if (workSection) {
        workSection.removeEventListener('mouseover', handleMouseOver);
        workSection.removeEventListener('mouseout', handleMouseOut);
        console.log('🧹 Card hover cleaned up');
      }
      
      // Reset refs no cleanup
      hoveredCardRef.current = null;
      isHoveringRef.current = false;
    };
  }, [handleMouseOver, handleMouseOut]);
};

export default useCardHover;