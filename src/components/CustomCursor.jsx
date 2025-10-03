import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const activeElementRef = useRef(null); // Controle do elemento ativo
  const [cursorText, setCursorText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [cursorType, setCursorType] = useState('');

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Posição do cursor
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId = null; // ← Armazena RAF ID para cancelar

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      rafId = requestAnimationFrame(animateCursor); // ← Guarda ID
    };

    rafId = requestAnimationFrame(animateCursor);

    // ============================================
    // LÓGICA CENTRALIZADA DO CURSOR
    // ============================================

    // ATIVAR: desativa anterior + ativa novo
    const activateCursor = (text, type, element) => {
      // Desativa elemento anterior se existir
      if (activeElementRef.current && activeElementRef.current !== element) {
        activeElementRef.current.classList.remove('custom-active');
      }
      
      // Ativa novo elemento
      setCursorText(text);
      setCursorType(type);
      setIsActive(true);
      element.classList.add('custom-active');
      
      // Atualiza referência
      activeElementRef.current = element;
      
      // Adiciona classe no body para esconder cursor nativo globalmente
      document.body.classList.add('custom-cursor-active');
    };

    // DESATIVAR: limpa apenas o elemento ativo atual
    const deactivateCursor = () => {
      setIsActive(false);
      setCursorText('');
      setCursorType('');
      
      if (activeElementRef.current) {
        activeElementRef.current.classList.remove('custom-active');
        activeElementRef.current = null;
      }
      
      // Remove classe do body para restaurar cursor nativo
      document.body.classList.remove('custom-cursor-active');
    };

    // ============================================
    // CONFIGURAÇÃO DE SECTIONS
    // ============================================

    const sectionsConfig = [
      { selector: '#hero', text: 'DRAG ME', type: 'hero' },
      { selector: '#about-us', text: '', type: 'default' },
      { selector: '#what-we-do', text: '', type: 'default' },
      { selector: '#statement', text: '', type: 'default' },
      { selector: '#contact', text: '', type: 'default' },
      { selector: '.modal', text: '', type: 'default' }
    ];

    const cleanupFunctions = [];

    // Setup listeners para sections
    sectionsConfig.forEach(({ selector, text, type }) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const handleEnter = () => {
        activateCursor(text, type, element);
      };

      const handleLeave = () => {
        deactivateCursor();
      };

      element.addEventListener('mouseenter', handleEnter);
      element.addEventListener('mouseleave', handleLeave);

      cleanupFunctions.push(() => {
        element.removeEventListener('mouseenter', handleEnter);
        element.removeEventListener('mouseleave', handleLeave);
      });
    });

    // ============================================
    // WORK CARDS
    // ============================================

    const setupWorkCards = () => {
      const workCards = document.querySelectorAll('.work-card--project');
      const workCardCleanups = [];

      workCards.forEach(card => {
        const handleCardEnter = () => {
          activateCursor('VIEW', 'work', card);
        };

        const handleCardLeave = () => {
          deactivateCursor();
        };

        card.addEventListener('mouseenter', handleCardEnter);
        card.addEventListener('mouseleave', handleCardLeave);

        workCardCleanups.push(() => {
          card.removeEventListener('mouseenter', handleCardEnter);
          card.removeEventListener('mouseleave', handleCardLeave);
        });
      });

      return workCardCleanups;
    };

    let workCardCleanups = setupWorkCards();

    // ============================================
    // INTERSECTION OBSERVER
    // ============================================

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Section ENTROU na viewport
          // Verifica se mouse está sobre ela
          const rect = element.getBoundingClientRect();
          const isMouseOver = mouseX >= rect.left && mouseX <= rect.right && 
                             mouseY >= rect.top && mouseY <= rect.bottom;
          
          if (isMouseOver) {
            // Encontra config da section
            const config = sectionsConfig.find(s => element.matches(s.selector));
            if (config) {
              activateCursor(config.text, config.type, element);
            } else if (element.classList.contains('work-card--project')) {
              activateCursor('VIEW', 'work', element);
            }
          }
        } else {
          // Section SAIU da viewport
          if (element === activeElementRef.current) {
            deactivateCursor();
          }
        }
      });
    }, {
      threshold: [0, 0.1, 0.5], // Múltiplos thresholds para melhor detecção
      rootMargin: '0px'
    });

    // Observa todas as sections
    sectionsConfig.forEach(({ selector }) => {
      const element = document.querySelector(selector);
      if (element) {
        intersectionObserver.observe(element);
      }
    });

    // Observa Work Cards
    const observeWorkCards = () => {
      document.querySelectorAll('.work-card--project').forEach(card => {
        intersectionObserver.observe(card);
      });
    };
    
    observeWorkCards();

    // ============================================
    // MUTATION OBSERVER (novos work cards)
    // ============================================

    const mutationObserver = new MutationObserver((mutations) => {
      const hasNewWorkCards = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && (
            node.classList?.contains('work-card--project') ||
            node.querySelector?.('.work-card--project')
          )
        )
      );

      if (hasNewWorkCards) {
        workCardCleanups.forEach(cleanup => cleanup());
        workCardCleanups = setupWorkCards();
        observeWorkCards();
      }
    });

    const workContainer = document.querySelector('#work-mount-point');
    if (workContainer) {
      mutationObserver.observe(workContainer, {
        childList: true,
        subtree: true
      });
    }

    document.addEventListener('mousemove', moveCursor);

    // ============================================
    // DETECÇÃO INICIAL (mouse já sobre elemento ao carregar)
    // ============================================
    
    // Usa primeiro mousemove para ter coordenadas reais
    const handleFirstMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const element = document.elementFromPoint(x, y);
      
      if (!element) return;
      
      // Tenta encontrar Hero
      const hero = element.closest('#hero');
      if (hero) {
        activateCursor('DRAG ME', 'hero', hero);
        return;
      }
      
      // Tenta encontrar Work Card
      const workCard = element.closest('.work-card--project');
      if (workCard) {
        activateCursor('VIEW', 'work', workCard);
        return;
      }
      
      // Tenta encontrar outras sections
      for (const { selector, text, type } of sectionsConfig) {
        const section = element.closest(selector);
        if (section && selector !== '#hero') {
          activateCursor(text, type, section);
          return;
        }
      }
    };
    
    // Adiciona listener que executa uma vez
    document.addEventListener('mousemove', handleFirstMove, { once: true });

    // ============================================
    // CLEANUP
    // ============================================

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      cleanupFunctions.forEach(cleanup => cleanup());
      workCardCleanups.forEach(cleanup => cleanup());
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      
      // ✅ FIXES CRÍTICOS
      if (rafId) cancelAnimationFrame(rafId); // Cancela RAF
      document.body.classList.remove('custom-cursor-active'); // Remove body class
    };
  }, []);

  // Mobile check
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }

  return (
    <div 
      ref={cursorRef}
      className={`custom-cursor ${isActive ? 'custom-cursor--active' : ''} ${cursorType === 'work' ? 'custom-cursor--work' : ''} ${cursorType === 'default' ? 'custom-cursor--default' : ''}`}
    >
      <span className="custom-cursor__text">
        {cursorText}
      </span>
    </div>
  );
};

export default CustomCursor;