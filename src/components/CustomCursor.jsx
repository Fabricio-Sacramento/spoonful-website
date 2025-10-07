// src/components/CustomCursor.jsx
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

  // ✅ CORRIGIDO: Anima scale diretamente, não via CSS variable
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

    // ✅ Anima scale com GSAP diretamente no transform
    gsap.to(cursor, {
      scale: config.scale,
      duration: 0.4,
      ease: 'back.out(1.7)',
      overwrite: 'auto',
      onComplete: () => {
        console.log(`✅ Scale complete: ${config.scale}`);
      }
    });

    // Atualiza texto
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

  const handleSectionChange = useCallback((sectionId, targetState) => {
    console.log(`🎯 Section: ${sectionId} → ${targetState}`);
    
    const success = transition(targetState);
    
    if (success && isMountedRef.current) {
      console.log(`✅ Transition OK`);
      updateCursorVisual();
    }
  }, [transition, updateCursorVisual]);

  const handleCardHover = useCallback((isHovering) => {
    console.log(`🎴 Card: ${isHovering}`);
    
    if (isHovering) {
      const success = transition(CURSOR_STATES.VIEW);
      if (success) updateCursorVisual();
    } else {
      const success = transition(CURSOR_STATES.GREEN_DOT);
      if (success) updateCursorVisual();
    }
  }, [transition, updateCursorVisual]);

  useSectionDetection(handleSectionChange, getCurrentState);
  useCardHover(handleCardHover);

  // ✅ CORRIGIDO: useEffect único com toda a lógica de setup
  useEffect(() => {
    if (shouldDisable()) {
      console.log('🚫 Custom cursor disabled');
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.appendChild(cursor);
    console.log('✅ Custom cursor mounted');

    // Set inicial com scale nativo
    gsap.set(cursor, { scale: 1 });

    xToRef.current = gsap.quickTo(cursor, 'x', {
      duration: 0.3,
      ease: 'power3'
    });

    yToRef.current = gsap.quickTo(cursor, 'y', {
      duration: 0.3,
      ease: 'power3'
    });

    // Mouse handlers
    const handleMouseMove = (e) => {
      if (!isMountedRef.current) return;
      xToRef.current(e.clientX);
      yToRef.current(e.clientY);
    };

    const handleMouseLeave = () => {
      if (!cursor || !isMountedRef.current) return;
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseEnter = () => {
      if (!cursor || !isMountedRef.current) return;
      gsap.to(cursor, {
        opacity: 1,
        scale: getStateConfig().scale,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Modal handlers
    const handleModalOpen = () => {
      console.log('🎬 Modal open event - forcing VIEW');
      transition(CURSOR_STATES.VIEW, true);
      updateCursorVisual();
    };

    const handleModalClose = () => {
      console.log('🎬 Modal close event - restoring to GREEN_DOT');
      transition(CURSOR_STATES.GREEN_DOT, true);
      updateCursorVisual();
    };

    // Registra todos os listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('modal:open', handleModalOpen);
    window.addEventListener('modal:close', handleModalClose);

    // Inicializa visual após mount
    setTimeout(() => {
      if (isMountedRef.current) {
        updateCursorVisual();
      }
    }, 100);

    // ✅ CLEANUP completo
    return () => {
      isMountedRef.current = false;
      
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('modal:open', handleModalOpen);
      window.removeEventListener('modal:close', handleModalClose);
      
      if (cursor && cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
      
      console.log('🧹 Custom cursor unmounted');
    };
  }, [shouldDisable, updateCursorVisual, getStateConfig, transition]);

  // Reage a mudanças de estado
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
        width: '120px',
        height: '120px',
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