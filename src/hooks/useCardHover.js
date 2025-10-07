// src/hooks/useCardHover.js
// ✅ CORRIGIDO: Detecta .work-track + bloqueia eventos durante modal

import { useEffect, useCallback, useRef } from 'react';

export const useCardHover = (onCardHover) => {
  const isHoveringRef = useRef(false);
  const isModalOpenRef = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (!isHoveringRef.current) {
      isHoveringRef.current = true;
      console.log('🎯 Work track hover START');
      onCardHover(true);
    }
  }, [onCardHover]);

  const handleMouseLeave = useCallback(() => {
    // Ignora mouseleave se modal está aberto
    if (isModalOpenRef.current) {
      console.log('🔒 Work track hover END blocked - modal is open');
      return;
    }
    
    if (isHoveringRef.current) {
      console.log('👋 Work track hover END');
      isHoveringRef.current = false;
      onCardHover(false);
    }
  }, [onCardHover]);

  useEffect(() => {
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Work track hover disabled');
      return;
    }

    // Listeners para modal
    const handleModalOpen = () => {
      console.log('🔒 Modal opened - blocking work track hover events');
      isModalOpenRef.current = true;
    };

    const handleModalClose = () => {
      console.log('🔓 Modal closed - allowing work track hover events');
      isModalOpenRef.current = false;
    };

    const attachListeners = () => {
      // Detecta .work-track (área real dos cards)
      const workTrack = document.querySelector('.work-track');
      
      if (!workTrack) {
        console.log('⏳ Work track not found yet...');
        return false;
      }

      workTrack.addEventListener('mouseenter', handleMouseEnter);
      workTrack.addEventListener('mouseleave', handleMouseLeave);
      
      // Registra listeners do modal
      window.addEventListener('modal:open', handleModalOpen);
      window.addEventListener('modal:close', handleModalClose);
      
      console.log('✅ Work track hover detection initialized');
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
      
      const workTrack = document.querySelector('.work-track');
      if (workTrack) {
        workTrack.removeEventListener('mouseenter', handleMouseEnter);
        workTrack.removeEventListener('mouseleave', handleMouseLeave);
      }
      
      window.removeEventListener('modal:open', handleModalOpen);
      window.removeEventListener('modal:close', handleModalClose);
      
      console.log('🧹 Work track hover cleaned up');
      isHoveringRef.current = false;
      isModalOpenRef.current = false;
    };
  }, [handleMouseEnter, handleMouseLeave]);
};

export default useCardHover;