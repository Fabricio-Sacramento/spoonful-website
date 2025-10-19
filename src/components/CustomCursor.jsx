// src/components/CustomCursor.jsx
// ✅ REVERTIDO ao original + apenas 3 linhas para nav hover

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useCursorFSM, CURSOR_STATES } from '../hooks/useCursorFSM';
import { useSectionDetection } from '../hooks/useSectionDetection';
import { useCardHover } from '../hooks/useCardHover';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null);
  const xToRef = useRef(null);
  const yToRef = useRef(null);
  const isMountedRef = useRef(true);

  const { currentState, transition, getStateConfig, getCurrentState } = useCursorFSM();

  const shouldDisable = useCallback(() => {
    const isTouch = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    
    const prefersReducedMotion = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return isTouch || prefersReducedMotion;
  }, []);

  const updateCursorVisual = useCallback(() => {
    if (!cursorRef.current || !isMountedRef.current) return;

    const config = getStateConfig();
    const cursor = cursorRef.current;
    const text = cursorTextRef.current;

    console.log(`🎨 Updating cursor:`, {
      state: getCurrentState(),
      scale: config.scale,
      showText: config.showText
    });

    gsap.to(cursor, {
      scale: config.scale,
      duration: 0.4,
      ease: 'back.out(1.7)',
      overwrite: 'auto',
      onComplete: () => {
        console.log(`✅ Scale complete: ${config.scale}`);
      }
    });

    if (text) {
      if (config.showText) {
        text.textContent = config.text;
        gsap.to(text, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(text, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            text.textContent = '';
          }
        });
      }
    }
  }, [getStateConfig, getCurrentState]);

  // Handler para mudanças de seção (ORIGINAL)
  const handleSectionChange = useCallback((sectionId, targetState) => {
    console.log(`📍 Section change: ${sectionId} → ${targetState}`);
    
    const success = transition(targetState);
    
    if (success && isMountedRef.current) {
      console.log(`✅ Cursor transition: ${getCurrentState()} → ${targetState}`);
      updateCursorVisual();
    }
  }, [transition, updateCursorVisual, getCurrentState]);

  // Card hover handler (ORIGINAL)
  const handleCardHover = useCallback((isHovering) => {
    console.log(`🎴 Card hover: ${isHovering}`);
    
    if (isHovering) {
      const success = transition(CURSOR_STATES.VIEW);
      if (success) updateCursorVisual();
    } else {
      const success = transition(CURSOR_STATES.GREEN_DOT);
      if (success) updateCursorVisual();
    }
  }, [transition, updateCursorVisual]);

  // ✅ NOVA FUNCIONALIDADE: Nav hover detection (apenas 3 linhas!)
  const handleNavHover = useCallback((isHovering) => {
    console.log(`🎯 Nav hover: ${isHovering}`);
    
    if (isHovering) {
      const success = transition(CURSOR_STATES.GREEN_DOT);
      if (success) updateCursorVisual();
    }
    // Quando sai do nav, o sistema de seções resolve automaticamente
  }, [transition, updateCursorVisual]);

  // Section detection (ORIGINAL)
  useSectionDetection(handleSectionChange, getCurrentState);
  
  // Card hover detection (ORIGINAL)
  useCardHover(handleCardHover);

  useEffect(() => {
    if (shouldDisable()) {
      console.log('🚫 Custom cursor disabled');
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.appendChild(cursor);
    console.log('✅ Custom cursor mounted');

    // Mouse movement (ORIGINAL)
    const handleMouseMove = (e) => {
      xToRef.current = e.clientX;
      yToRef.current = e.clientY;
      
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    // ✅ ADICIONA: Nav menu hover detection (SIMPLES)
    const navMenu = document.querySelector('.nav-menu-container');
    if (navMenu) {
      navMenu.addEventListener('mouseenter', () => handleNavHover(true));
      navMenu.addEventListener('mouseleave', () => handleNavHover(false));
      console.log('✅ Nav hover detection added');
    }

    return () => {
      console.log('🧹 Custom cursor unmounted');
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (navMenu) {
        navMenu.removeEventListener('mouseenter', () => handleNavHover(true));
        navMenu.removeEventListener('mouseleave', () => handleNavHover(false));
      }
      
      if (cursor && cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, [shouldDisable, updateCursorVisual, getStateConfig, transition, handleNavHover]);

  useEffect(() => {
    updateCursorVisual();
  }, [currentState, updateCursorVisual]);

  if (shouldDisable()) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '80px',
        height: '80px',
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translate(-50%, -50%) translateZ(0)',
        willChange: 'transform',
        opacity: 1
      }}
    >
      <span
        ref={cursorTextRef}
        className="cursor-text"
        style={{
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default CustomCursor;