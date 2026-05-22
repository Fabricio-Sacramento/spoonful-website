// src/components/NavMenu.jsx
// CORREÇÃO: Statement "agarrando" no Work

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { refreshScrollTriggers } from '../scripts/scroll-orchestrator';

gsap.registerPlugin(ScrollTrigger);

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#hero', type: 'anchor' },
  { id: 'about-us', label: 'About Us', href: '#about-us', type: 'anchor' },
  { id: 'what-we-do', label: 'What We Do', href: '#what-we-do', type: 'anchor' },
  { id: 'work', label: 'Work', href: '#work', type: 'anchor' },
  { id: 'statement', label: 'Statement', href: '#statement', type: 'anchor' },
  { id: 'contact', label: 'Contact', href: '#contact', type: 'anchor' },
  { id: 'about-me', label: 'About Me', href: null, type: 'overlay' }
];

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const toggleRef = useRef(null);
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  
  const entryTl = useRef(null);
  const openTl = useRef(null);
  
  const hasEnteredRef = useRef(false);

  // ================================
  // DETECÇÃO ABSOLUTA MELHORADA
  // ================================
  const detectAbsolutePosition = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    
    // TOPO ABSOLUTO: Hero (0-50px de tolerância)
    if (scrollY <= 50) {
      return 'home';
    }
    
    // FINAL ABSOLUTO: Contact (últimos 100px - aumentei tolerância)
    if (scrollY >= maxScroll - 100) {
      return 'contact';
    }
    
    // ZONA HERO/ABOUT-US: Primeira viewport (até 100vh)
    if (scrollY <= windowHeight) {
      if (scrollY <= windowHeight * 0.5) {
        return 'home';
      }
      return 'about-us';
    }
    
    // ✅ NOVA LÓGICA: DETECÇÃO BASEADA EM ELEMENTOS REAIS
    
    // Verifica se Statement wrapper está visível e ativo
    const statementWrapper = document.querySelector('.statement-contact-wrapper');
    if (statementWrapper) {
      const wrapperRect = statementWrapper.getBoundingClientRect();
      const wrapperTop = scrollY + wrapperRect.top;
      const wrapperBottom = wrapperTop + statementWrapper.offsetHeight;
      
      // Se estamos dentro do wrapper Statement/Contact
      if (scrollY >= wrapperTop - 100 && scrollY <= wrapperBottom + 100) {
        // Dentro do wrapper, verifica se Contact está revelado
        const contactLayer = document.querySelector('.contact-layer');
        const isContactRevealed = contactLayer?.getAttribute('aria-hidden') === 'false' ||
                                 contactLayer?.classList.contains('contact--revealed');
        
        if (isContactRevealed) {
          return 'contact';
        } else {
          return 'statement';
        }
      }
    }
    
    // ✅ FALLBACK: DETECÇÃO POR POSIÇÃO RELATIVA MAIS CONSERVADORA
    
    // Se estamos nos últimos 30% da página, provavelmente Statement/Contact
    const lastThirdStart = maxScroll * 0.7;
    if (scrollY >= lastThirdStart) {
      // Dentro do último terço, verifica posição mais específica
      const statementZoneEnd = maxScroll - (windowHeight * 0.3);
      
      if (scrollY <= statementZoneEnd) {
        return 'statement';
      } else {
        return 'contact';
      }
    }
    
    // SEÇÕES INTERMEDIÁRIAS: deixa IntersectionObserver decidir
    return null;
  }, []);

  // ================================
  // NAVEGAÇÃO CONDICIONAL (mantida igual)
  // ================================
  const handleSmartNavigation = useCallback((targetItem) => {
    const currentPosition = detectAbsolutePosition();
    
    
    // CASO 1: Hero → About Us
    if (currentPosition === 'home' && targetItem.id === 'about-us') {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // CASO 2: Statement → Contact
    if (currentPosition === 'statement' && targetItem.id === 'contact') {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // CASO 3: Contact → Statement (scroll 1 viewport para cima)
    if (currentPosition === 'contact' && targetItem.id === 'statement') {
      window.scrollTo({
        top: window.scrollY - window.innerHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // CASO 4: About Us → Hero
    if (currentPosition === 'about-us' && targetItem.id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // ✅ NOVO: NAVEGAÇÃO ESPECÍFICA PARA STATEMENT
    if (targetItem.id === 'statement') {
      // scrollIntoView não respeita pinSpacing do GSAP — usa posição real do ScrollTrigger
      const st = ScrollTrigger.getById('statement-contact-tl') || ScrollTrigger.getById('statement-pin');
      if (st) {
        window.scrollTo({ top: st.start + 50, behavior: 'smooth' });
      } else {
        const statementTarget = document.querySelector('.statement-contact-wrapper') || document.querySelector('#statement');
        if (statementTarget) statementTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    
    // CASOS NORMAIS: navegação padrão
    if (targetItem.id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetItem.id === 'contact') {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      });
    } else if (targetItem.href) {
      const target = document.querySelector(targetItem.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => refreshScrollTriggers(), 900);
      }
    }
    
  }, [detectAbsolutePosition]);

  // ================================
  // DETECÇÃO COM DEBUG MELHORADO
  // ================================
  useEffect(() => {
    let isDetecting = true;
    
    const updateActiveSection = () => {
      if (!isDetecting) return;
      
      const absolutePosition = detectAbsolutePosition();
      
      if (absolutePosition) {
        if (activeSection !== absolutePosition) {
          setActiveSection(absolutePosition);
        }
        return;
      }
      
      // Para seções intermediárias, IntersectionObserver decide
    };
    
    // Detecção em scroll (throttled)
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        updateActiveSection();
        scrollTimeout = null;
      }, 16);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Detecção inicial
    updateActiveSection();
    
    return () => {
      isDetecting = false;
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [activeSection, detectAbsolutePosition]);

  // ================================
  // INTERSECTION OBSERVER MAIS ESPECÍFICO
  // ================================
  useEffect(() => {
    const intermediateSections = [
      { id: 'what-we-do', element: document.querySelector('#what-we-do') },
      { id: 'work', element: document.querySelector('#work') }
    ].filter(s => s.element);

    if (intermediateSections.length === 0) return;

    const observerOptions = {
      threshold: [0.6], // Aumentei threshold para ser mais específico
      rootMargin: '-15% 0px -15% 0px' // Reduzi margem para evitar conflitos
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = intermediateSections.find(s => s.element === entry.target);
          if (section) {
            const absolutePosition = detectAbsolutePosition();
            
            // ✅ CRÍTICO: Só atualiza se não estivermos em zona de sobreposição
            // E se não estivermos próximos ao Statement/Contact
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const nearStatement = scrollY >= maxScroll * 0.7; // Últimos 30%
            
            if (!absolutePosition && !nearStatement) {
              setActiveSection(section.id);
            } else {
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    intermediateSections.forEach(section => {
      observer.observe(section.element);
    });


    return () => {
      observer.disconnect();
    };
  }, [detectAbsolutePosition]);

  // ================================
  // DEBUG HELPER (remover em produção)
  // ================================
  useEffect(() => {
    if (import.meta.env.DEV && window.location.hash === '#debug') {
      window.debugNavMenu = {
        getCurrentSection: () => activeSection,
        detectPosition: detectAbsolutePosition,
        getScrollInfo: () => ({
          scrollY: window.scrollY,
          maxScroll: document.documentElement.scrollHeight - window.innerHeight,
          statementWrapper: document.querySelector('.statement-contact-wrapper')?.getBoundingClientRect(),
          contactRevealed: document.querySelector('.contact-layer')?.getAttribute('aria-hidden') === 'false'
        })
      };
      
    }
  }, [activeSection, detectAbsolutePosition]);

  // ================================
  // RESTO DO CÓDIGO (mantido igual)
  // ================================
  
  // Animação de entrada
  useEffect(() => {
    if (hasEnteredRef.current) return;
    
    const logo = logoRef.current;
    const toggle = toggleRef.current;
    const items = itemsRef.current.filter(Boolean);

    if (!logo || !toggle) return;

    gsap.set(items, { y: 0, opacity: 0, visibility: 'visible' });
    gsap.set(logo, { x: 200, opacity: 0 });
    gsap.set(toggle, { x: 100, opacity: 0 });

    // ⬇️ NOVO: Aguarda preloader antes de animar
    const startAnimation = () => {
      if (hasEnteredRef.current) return;
      hasEnteredRef.current = true;

      entryTl.current = gsap.timeline({ delay: 0.5 });

      entryTl.current
        .to(logo, { x: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' }, 0)
        .to(toggle, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.4);
    };

    // Escuta evento do preloader
    window.addEventListener('preloader:complete', startAnimation, { once: true });

    return () => {
      if (entryTl.current) entryTl.current.kill();
      window.removeEventListener('preloader:complete', startAnimation);
    };
  }, []);

  // ================================
  // ANIMAÇÃO OPEN/CLOSE (mantida igual)
  // ================================
  useEffect(() => {
    const logo = logoRef.current;
    const items = itemsRef.current.filter(Boolean);

    if (!logo || items.length === 0) return;

    if (openTl.current) openTl.current.kill();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (isOpen) {
      openTl.current = gsap.timeline();

      const movingItems = items.slice(1);

      if (prefersReducedMotion) {
        gsap.set(items, { opacity: 1 });
        gsap.set(logo, { x: -135 });
        movingItems.forEach((item, i) => {
          gsap.set(item, { y: (i + 1) * 48 });
        });
      } else {
        gsap.set(movingItems, { y: 0 });

        openTl.current
          .set(items, { opacity: 1 }, 0)
          .to(logo, {
            x: -135,
            duration: 0.5,
            ease: 'power3.out'
          }, 0)
          .set(movingItems.slice(1), { y: 0 }, 0.3)
          .to(movingItems.slice(0, 1), {
            y: 48,
            duration: 0.18,
            ease: 'power3.out'
          }, 0.3)
          .set(movingItems.slice(1, 2), { y: 48 }, 0.45)
          .set(movingItems.slice(2), { y: 48 }, 0.45)
          .to(movingItems.slice(1, 2), {
            y: 96,
            duration: 0.18,
            ease: 'power3.out'
          }, 0.45)
          .set(movingItems.slice(2, 3), { y: 96 }, 0.6)
          .set(movingItems.slice(3), { y: 96 }, 0.6)
          .to(movingItems.slice(2, 3), {
            y: 144,
            duration: 0.18,
            ease: 'power3.out'
          }, 0.6)
          .set(movingItems.slice(3, 4), { y: 144 }, 0.75)
          .set(movingItems.slice(4), { y: 144 }, 0.75)
          .to(movingItems.slice(3, 4), {
            y: 192,
            duration: 0.18,
            ease: 'power3.out'
          }, 0.75)
          .set(movingItems.slice(4, 5), { y: 192 }, 0.9)
          .set(movingItems.slice(5), { y: 192 }, 0.9)
          .to(movingItems.slice(4, 5), {
            y: 240,
            duration: 0.18,
            ease: 'power3.out'
          }, 0.9)
          .set(movingItems.slice(5, 6), { y: 240 }, 1.05)
          .to(movingItems.slice(5, 6), {
            y: 288,
            duration: 0.18,
            ease: 'power3.out'
          }, 1.05);
      }
    } else {
      openTl.current = gsap.timeline();

      const movingItems = items.slice(1);

      if (prefersReducedMotion) {
        gsap.set(movingItems, { y: 0 });
        gsap.set(logo, { x: 0 });
        gsap.set(items, { opacity: 0 });
      } else {
        openTl.current
          .to(movingItems.slice(5, 6), {
            y: 240,
            duration: 0.18,
            ease: 'power2.in'
          }, 0)
          .to(movingItems.slice(4, 6), {
            y: 192,
            duration: 0.18,
            ease: 'power2.in'
          }, 0.15)
          .to(movingItems.slice(3, 6), {
            y: 144,
            duration: 0.18,
            ease: 'power2.in'
          }, 0.3)
          .to(movingItems.slice(2, 6), {
            y: 96,
            duration: 0.18,
            ease: 'power2.in'
          }, 0.45)
          .to(movingItems.slice(1, 6), {
            y: 48,
            duration: 0.18,
            ease: 'power2.in'
          }, 0.6)
          .to(movingItems.slice(0, 6), {
            y: 0,
            duration: 0.18,
            ease: 'power2.in'
          }, 0.75)
          .to(logo, {
            x: 0,
            duration: 0.5,
            ease: 'power3.inOut'
          }, 0.3)
          .set(items, { opacity: 0 }, 0.93);
      }
    }

    return () => {
      if (openTl.current) openTl.current.kill();
    };
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((item) => {
    setIsOpen(false);

    if (item.type === 'anchor') {
      // ✅ SIMPLES: Atualiza seção ativa imediatamente quando clica
      setActiveSection(item.id);
      
      setTimeout(() => {
        handleSmartNavigation(item);
      }, 600);
    } else if (item.type === 'overlay' && item.id === 'about-me') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav:open-about-drawer'));
      }, 600);
    }
  }, [handleSmartNavigation]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // RENDER (mantido igual)
  return (
    <nav
      ref={containerRef}
      className={`nav-menu-container ${isOpen ? 'open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="nav-menu-stack">
        <div ref={logoRef} className="nav-menu-logo">
          Spoonful
        </div>

        <ul ref={listRef} id="nav-menu-list" className="nav-menu-list" role="navigation">
          {NAV_ITEMS.map((item, index) => {
            const zIndex = 9 - index;
            
            return (
              <li key={item.id} style={{ position: 'relative', height: 0 }}>
                <a
                  ref={el => itemsRef.current[index] = el}
                  href={item.href || '#'}
                  className={`nav-menu-item ${activeSection === item.id ? 'active' : ''}`}
                  style={{ zIndex }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        ref={toggleRef}
        className="nav-menu-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="nav-menu-list"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <svg className="nav-menu-icon" width="28" height="24" viewBox="0 0 28 24" fill="none">
          <line className="nav-menu-icon-line" x1="4" y1="4" x2="24" y2="4" strokeWidth="4" strokeLinecap="round" />
          <line className="nav-menu-icon-line" x1="4" y1="12" x2="24" y2="12" strokeWidth="4" strokeLinecap="round" />
          <line className="nav-menu-icon-line" x1="4" y1="20" x2="24" y2="20" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </button>
    </nav>
  );
};

export default NavMenu;