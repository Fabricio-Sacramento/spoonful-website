// src/components/CustomCursor.jsx
// ATUALIZAÇÃO: Melhor responsividade para hover no nav menu

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
  const mousePositionRef = useRef({ x: 0, y: 0 });

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


    gsap.to(cursor, {
      scale: config.scale,
      duration: 0.3, // ✅ REDUZIDO: 0.4 → 0.3 para resposta mais rápida no nav
      ease: 'back.out(1.7)',
      overwrite: 'auto',
      onComplete: () => {
      }
    });

    if (text) {
      if (config.showText) {
        text.textContent = config.text;
        gsap.to(text, {
          opacity: 1,
          duration: 0.2, // ✅ REDUZIDO: 0.3 → 0.2 para resposta mais rápida
          ease: 'power2.out'
        });
      } else {
        gsap.to(text, {
          opacity: 0,
          duration: 0.15, // ✅ REDUZIDO: 0.2 → 0.15
          ease: 'power2.in',
          onComplete: () => {
            text.textContent = '';
          }
        });
      }
    }
  }, [getStateConfig, getCurrentState]);

  const handleSectionChange = useCallback((sectionId, targetState) => {
    
    // ✅ NOVO: Prioridade especial para nav-hover
    let success;
    if (sectionId === 'nav-hover') {
      // Force transition para nav hover (ignora FSM restrictions)
      success = transition(targetState, true);
    } else {
      success = transition(targetState);
    }
    
    if (success && isMountedRef.current) {
      updateCursorVisual();
    }
  }, [transition, updateCursorVisual]);

  const handleCardHover = useCallback((isHovering) => {
    
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

  useEffect(() => {
    if (shouldDisable()) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.appendChild(cursor);

    gsap.set(cursor, { scale: 1 });

    xToRef.current = gsap.quickTo(cursor, 'x', {
      duration: 0.25, // ✅ REDUZIDO: 0.3 → 0.25 para movimento mais responsivo
      ease: 'power3'
    });

    yToRef.current = gsap.quickTo(cursor, 'y', {
      duration: 0.25, // ✅ REDUZIDO: 0.3 → 0.25
      ease: 'power3'
    });

    const handleMouseMove = (e) => {
      if (!isMountedRef.current) return;
      
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      
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

    const handleModalOpen = () => {
      transition(CURSOR_STATES.GREEN_DOT, true);
      updateCursorVisual();
    };

    const handleModalClose = () => {

      // Double RAF: aguarda modal sair do DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const { x, y } = mousePositionRef.current;
          const elementUnderMouse = document.elementFromPoint(x, y);

          // ✅ NOVO: Checa se mouse está sobre nav menu
          const navMenu = elementUnderMouse?.closest('.nav-menu-container');
          if (navMenu) {
            transition(CURSOR_STATES.GREEN_DOT, true);
            updateCursorVisual();
            return;
          }

          // Busca #work
          const workSection = elementUnderMouse?.closest('#work');
          if (workSection) {
            transition(CURSOR_STATES.VIEW);
            updateCursorVisual();
          } else {
            transition(CURSOR_STATES.GREEN_DOT, true);
            updateCursorVisual();
          }
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('modal:open', handleModalOpen);
    window.addEventListener('modal:close', handleModalClose);

    setTimeout(() => {
      if (isMountedRef.current) {
        updateCursorVisual();
      }
    }, 100);

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
      
    };
  }, [shouldDisable, updateCursorVisual, getStateConfig, transition]);

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