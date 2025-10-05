import { useEffect, useRef } from 'react';
import { useCursor } from '../hooks/useCursor';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const { cursorType, cursorText } = useCursor();
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Mobile check - não renderiza em dispositivos pequenos
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;

    // Handler de movimento do mouse
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Loop de animação suave com RAF
    const updateCursorPosition = () => {
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      rafIdRef.current = requestAnimationFrame(updateCursorPosition);
    };

    // Inicia listener e loop
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafIdRef.current = requestAnimationFrame(updateCursorPosition);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Não renderiza em mobile
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }

  // Classes dinâmicas baseadas no tipo
  const cursorClasses = [
    'custom-cursor',
    cursorType === 'hero' && 'custom-cursor--hero',
    cursorType === 'work' && 'custom-cursor--work',
    cursorType === 'default' && 'custom-cursor--default'
  ].filter(Boolean).join(' ');

  return (
    <div ref={cursorRef} className={cursorClasses}>
      {cursorText && <span className="custom-cursor__text">{cursorText}</span>}
    </div>
  );
};

export default CustomCursor;