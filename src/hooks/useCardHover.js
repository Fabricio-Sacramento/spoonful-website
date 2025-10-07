// src/hooks/useCardHover.js
// ✅ CORRIGIDO: Detecta work-track em vez de cards individuais

import { useEffect, useCallback, useRef } from 'react';

export const useCardHover = (onCardHover) => {
  const isHoveringRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      console.log('🎯 Work section hover START');
      onCardHover(true);
    }
  }, [onCardHover]);

  const handleMouseLeave = useCallback(() => {
    if (isHoveringRef.current) {
      console.log('👋 Work section hover END');
      isHoveringRef.current = false;
      onCardHover(false);
    }
  }, [onCardHover]);

  useEffect(() => {
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Work section hover disabled');
      return;
    }

    const attachListeners = () => {
      // ✅ MUDANÇA CRÍTICA: Detecta o container, não os cards
      const workSection = document.querySelector('#work');
      
      if (!workSection) {
        console.log('⏳ Work section not found yet...');
        return false;
      }

      // ✅ mouseenter/mouseleave no container pai
      workSection.addEventListener('mouseenter', handleMouseEnter);
      workSection.addEventListener('mouseleave', handleMouseLeave);
      
      console.log('✅ Work section hover detection initialized');
      return true;
    };

    let retryCount = 0;
    const maxRetries = 10;
    
    const initInterval = setInterval(() => {
      if (attachListeners() || retryCount >= maxRetries) {
        clearInterval(initInterval);
      }
      retryCount++;
    }, 300);

    return () => {
      clearInterval(initInterval);
      
      const workSection = document.querySelector('#work');
      if (workSection) {
        workSection.removeEventListener('mouseenter', handleMouseEnter);
        workSection.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      console.log('🧹 Work section hover cleaned up');
      isHoveringRef.current = false;
    };
  }, [handleMouseEnter, handleMouseLeave]);
};

export default useCardHover;