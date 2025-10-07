// src/components/CustomCursor.jsx
// Custom cursor com FSM, GSAP quickTo e Intersection Observer

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useCursorFSM, CURSOR_STATES } from '../hooks/useCursorFSM';
import { useSectionDetection } from '../hooks/useSectionDetection';
import { useCardHover } from '../hooks/useCardHover';

const CustomCursor = () => {
  // Refs
  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null);
  const xToRef = useRef(null);
  const yToRef = useRef(null);
  const isMountedRef = useRef(true);

  // FSM para gerenciar estados
  const { currentState, transition, getStateConfig, getCurrentState } = useCursorFSM();

  // Guards: desabilita cursor se necessário
  const shouldDisable = useCallback(() => {
    // Touch devices
    const isTouch = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    
    // Reduced motion
    const prefersReducedMotion = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return isTouch || prefersReducedMotion;
  }, []);

  // Atualiza visual do cursor baseado no estado FSM
  const updateCursorVisual = useCallback(() => {
    if (!cursorRef.current || !isMountedRef.current) return;

    const config = getStateConfig();
    const cursor = cursorRef.current;
    const text = cursorTextRef.current;

    // Anima scale via CSS variable (transform-only)
    gsap.to(cursor, {
      '--cursor-scale': config.scale,
      duration: 0.4,
      ease: 'back.out(1.7)',
      overwrite: 'auto'
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
          ease: 'power2.in'
        });
      }
    }
  }, [getStateConfig]);

  // Handler: mudança de seção (IO)
  const handleSectionChange = useCallback((sectionId, targetState) => {
    console.log(`🎯 handleSectionChange called: ${sectionId} → ${targetState}`);
    console.log(`   Current state: ${getCurrentState()}`);
    
    const success = transition(targetState);
    
    if (success && isMountedRef.current) {
      console.log(`   ✅ Transition successful, updating visual`);
      updateCursorVisual();
    } else {
      console.log(`   ❌ Transition blocked by FSM`);
    }
  }, [transition, updateCursorVisual, getCurrentState]);

  // Handler: hover em cards
  const handleCardHover = useCallback((isHovering) => {
    if (isHovering) {
      const success = transition(CURSOR_STATES.VIEW);
      if (success) updateCursorVisual();
    } else {
      // Volta para GREEN_DOT (sempre permitido de VIEW)
      const success = transition(CURSOR_STATES.GREEN_DOT);
      if (success) updateCursorVisual();
    }
  }, [transition, updateCursorVisual]);

  // Inicializa Intersection Observer
  useSectionDetection(handleSectionChange, getCurrentState);

  // Inicializa detecção de hover em cards
  useCardHover(handleCardHover);

  // Setup inicial do cursor
  useEffect(() => {
    // Guard: desabilita cursor se necessário
    if (shouldDisable()) {
      console.log('🚫 Custom cursor disabled (touch/reduced-motion)');
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Append como último elemento do body (z-index máximo)
    document.body.appendChild(cursor);
    console.log('✅ Custom cursor mounted');

    // Setup GSAP quickTo para performance máxima
    xToRef.current = gsap.quickTo(cursor, 'x', {
      duration: 0.3,
      ease: 'power3'
    });

    yToRef.current = gsap.quickTo(cursor, 'y', {
      duration: 0.3,
      ease: 'power3'
    });

    // Mouse move handler
    const handleMouseMove = (e) => {
      if (!isMountedRef.current) return;
      
      // GSAP quickTo: performance otimizada
      xToRef.current(e.clientX);
      yToRef.current(e.clientY);
    };

    // Mouse leave viewport: estaciona cursor
    const handleMouseLeave = () => {
      if (!cursor || !isMountedRef.current) return;
      
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Mouse enter viewport: reativa cursor
    const handleMouseEnter = () => {
      if (!cursor || !isMountedRef.current) return;
      
      gsap.to(cursor, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Registra listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Estado inicial visual
    updateCursorVisual();

    // Cleanup rigoroso
    return () => {
      isMountedRef.current = false;
      
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      if (cursor && cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
      
      console.log('🧹 Custom cursor unmounted');
    };
  }, [shouldDisable, updateCursorVisual]);

  // Atualiza visual quando estado FSM muda
  useEffect(() => {
    updateCursorVisual();
  }, [currentState, updateCursorVisual]);

  // Guard: não renderiza se desabilitado
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
        transform: 'translate(-50%, -50%) scale(var(--cursor-scale, 1)) translateZ(0)',
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