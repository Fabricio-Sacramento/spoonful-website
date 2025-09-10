import { useEffect, useRef, useState } from 'react';
//import { gsap } from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [cursorText, setCursorText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [cursorType, setCursorType] = useState(''); // 'hero' ou 'work'

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Posição inicial do cursor
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Função para mover cursor com delay suave
    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Animação suave do cursor seguindo o mouse
    const animateCursor = () => {
      // Delay interpolation - cursor "alcança" o mouse
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      requestAnimationFrame(animateCursor);
    };

    // Inicia animação
    animateCursor();

    // Função para ativar cursor
    const activateCursor = (text, type) => {
      setCursorText(text);
      setCursorType(type);
      setIsActive(true);
      
      // Adiciona classe para esconder cursor nativo
      if (type === 'hero') {
        document.getElementById('hero')?.classList.add('cursor-active');
      }
    };

    // Função para desativar cursor
    const deactivateCursor = () => {
      setIsActive(false);
      setCursorText('');
      
      // Remove classes de cursor ativo
      document.getElementById('hero')?.classList.remove('cursor-active');
      document.querySelectorAll('.work-card--project').forEach(card => {
        card.classList.remove('cursor-active');
      });
      
      setCursorType('');
    };

    // Event listeners para Hero Section
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
      const handleHeroEnter = () => activateCursor('DRAG ME', 'hero');
      const handleHeroLeave = () => deactivateCursor();
      
      heroSection.addEventListener('mouseenter', handleHeroEnter);
      heroSection.addEventListener('mouseleave', handleHeroLeave);
    }

    // Event listeners para Work Cards
    const setupWorkCards = () => {
      const workCards = document.querySelectorAll('.work-card--project');
      
      workCards.forEach(card => {
        const handleCardEnter = () => {
          activateCursor('VIEW', 'work');
          card.classList.add('cursor-active');
        };
        const handleCardLeave = () => {
          deactivateCursor();
        };
        
        card.addEventListener('mouseenter', handleCardEnter);
        card.addEventListener('mouseleave', handleCardLeave);
      });
    };

    // Setup inicial
    setupWorkCards();

    // Observer para detectar novos work cards
    const observer = new MutationObserver(() => {
      setupWorkCards();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Mouse move global
    document.addEventListener('mousemove', moveCursor);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      
      if (heroSection) {
        heroSection.removeEventListener('mouseenter', () => activateCursor('DRAG ME', 'hero'));
        heroSection.removeEventListener('mouseleave', deactivateCursor);
      }

      observer.disconnect();
    };
  }, []);

  // Não renderiza em mobile
  if (window.innerWidth < 1024) {
    return null;
  }

  return (
    <div 
      ref={cursorRef}
      className={`custom-cursor ${isActive ? 'custom-cursor--active' : ''} ${cursorType === 'work' ? 'custom-cursor--work' : ''}`}
    >
      <span className="custom-cursor__text">
        {cursorText}
      </span>
    </div>
  );
};

export default CustomCursor;