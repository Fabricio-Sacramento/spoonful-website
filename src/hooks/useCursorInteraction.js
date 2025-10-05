// src/hooks/useCursorInteraction.js
import { useEffect } from 'react';
import { useCursor } from './useCursor';

/**
 * Hook para controlar cursor em sections/elementos
 * 
 * @param {Object} ref - React ref do elemento
 * @param {string} type - Tipo do cursor ('hero', 'work', 'default')
 * @param {string} text - Texto a exibir no cursor (opcional)
 */
export const useCursorInteraction = (ref, type = 'default', text = '') => {
  const { setCursorType, setCursorText } = useCursor();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mobile check
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    const handleMouseEnter = () => {
      setCursorType(type);
      setCursorText(text);
    };

    const handleMouseLeave = () => {
      setCursorType('default');
      setCursorText('');
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, type, text, setCursorType, setCursorText]);
};