// src/hooks/useCardHover.js
// Event delegation para detectar hover em cards do Work com performance otimizada

import { useEffect, useCallback } from 'react';

/**
 * Hook para detectar hover em cards usando event delegation
 * Single listener no container, evita N listeners em cards individuais
 * 
 * @param {Function} onCardHover - Callback(isHovering: boolean)
 */
export const useCardHover = (onCardHover) => {
  
  // Handler otimizado com closest() - bubbling natural
  const handleMouseEnter = useCallback((e) => {
    // Checa se hover está em card com data-cursor="view"
    const card = e.target.closest('[data-cursor="view"]');
    
    if (card) {
      console.log('🎯 Card hover detected');
      onCardHover(true);
    }
  }, [onCardHover]);

  const handleMouseLeave = useCallback((e) => {
    const card = e.target.closest('[data-cursor="view"]');
    
    if (card) {
      console.log('👋 Card hover ended');
      onCardHover(false);
    }
  }, [onCardHover]);

  useEffect(() => {
    // Guard: touch devices
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Card hover disabled - touch device');
      return;
    }

    // Espera Work Section estar montada
    const checkWorkSection = () => {
      const workSection = document.getElementById('work');
      
      if (!workSection) {
        console.log('⏳ Waiting for Work section...');
        return false;
      }

      // Event delegation: listener no container, capture phase
      workSection.addEventListener('mouseenter', handleMouseEnter, true);
      workSection.addEventListener('mouseleave', handleMouseLeave, true);
      
      console.log('✅ Card hover detection initialized (event delegation)');
      return true;
    };

    // Retry com delay (Work é montado assincronamente)
    let retryCount = 0;
    const maxRetries = 10;
    
    const initInterval = setInterval(() => {
      if (checkWorkSection() || retryCount >= maxRetries) {
        clearInterval(initInterval);
      }
      retryCount++;
    }, 300);

    // Cleanup
    return () => {
      clearInterval(initInterval);
      
      const workSection = document.getElementById('work');
      if (workSection) {
        workSection.removeEventListener('mouseenter', handleMouseEnter, true);
        workSection.removeEventListener('mouseleave', handleMouseLeave, true);
        console.log('🧹 Card hover detection cleaned up');
      }
    };
  }, [handleMouseEnter, handleMouseLeave]);
};

export default useCardHover;