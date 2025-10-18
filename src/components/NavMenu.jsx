// src/components/NavMenu.jsx
// Menu de navegação com animações GSAP e detecção de seção ativa

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Configuração dos itens do menu
const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#hero', type: 'anchor' },
  { id: 'about-us', label: 'About Us', href: '#about-us', type: 'anchor' },
  { id: 'what-we-do', label: 'What We Do', href: '#what-we-do', type: 'anchor' },
  { id: 'work', label: 'Work', href: '#work', type: 'anchor' },
  { id: 'statement', label: 'Statement', href: '#statement', type: 'anchor' },
  { id: 'contact', label: 'Contact', href: '#contact', type: 'anchor' },
  { id: 'about-me', label: 'About Me', href: null, type: 'overlay' } // Abre AboutDrawer
];

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Refs para animação
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const toggleRef = useRef(null);
  const listRef = useRef(null);
  const itemsRef = useRef([]);
  
  // Timeline refs
  const entryTl = useRef(null);
  const openTl = useRef(null);
  
  // Flag de primeira renderização
  const hasEnteredRef = useRef(false);

  // ================================
  // ANIMAÇÃO DE ENTRADA (Page Load)
  // ================================
  useEffect(() => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const logo = logoRef.current;
    const toggle = toggleRef.current;
    const items = itemsRef.current.filter(Boolean);

    if (!logo || !toggle) return;

    // ✅ CRÍTICO: Itens começam INVISÍVEIS (opacity: 0)
    // Só ficam visíveis quando menu abre
    gsap.set(items, { 
      y: 0, 
      opacity: 0, // ← Invisíveis no início
      visibility: 'visible' // Mas não display:none
    });

    console.log('🎬 Nav Menu: Itens inicializados (invisíveis):', items.length);

    // Estado inicial: logo e burger fora da tela
    gsap.set(logo, { x: 200, opacity: 0 });
    gsap.set(toggle, { x: 100, opacity: 0 });

    // Timeline de entrada
    entryTl.current = gsap.timeline({ delay: 0.5 });

    entryTl.current
      // Logo entra com elastic easing
      .to(logo, {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
      }, 0)
      // Hamburger entra depois
      .to(toggle, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, 0.4);

    console.log('🎬 Nav Menu: Animação de entrada iniciada');

    return () => {
      if (entryTl.current) entryTl.current.kill();
    };
  }, []);

  // ================================
  // ANIMAÇÃO OPEN/CLOSE
  // ================================
  useEffect(() => {
    const logo = logoRef.current;
    const items = itemsRef.current.filter(Boolean);

    if (!logo || items.length === 0) return;

    // Kill timeline anterior se existir
    if (openTl.current) openTl.current.kill();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (isOpen) {
      // ============ ABERTURA ============
      openTl.current = gsap.timeline({
        onStart: () => {
          console.log('🎬 Animação OPEN iniciada');
        }
      });

      // ✅ Items que vão se mover (About Us em diante - índices 1-6)
      const movingItems = items.slice(1); // Pula Home (index 0)

      if (prefersReducedMotion) {
        gsap.set(items, { opacity: 1 }); // Todos visíveis instantâneo
        gsap.set(logo, { x: -135 });
        movingItems.forEach((item, i) => {
          gsap.set(item, { y: (i + 1) * 56 });
        });
      } else {
        openTl.current
          // 1. INSTANTÂNEO: Todos os botões ficam visíveis (sem fade)
          .set(items, { opacity: 1 }, 0)
          // 2. Logo desloca para esquerda (revela Home que já está visível)
          .to(logo, {
            x: -135,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Home revelado (já estava opacity:1)')
          }, 0)
          // 3. Cascata: About Us..About Me descem (SÓ MOVIMENTO, sem fade)
          .to(movingItems, {
            y: (index) => (index + 1) * 56,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Cascata completa')
          }, 0.3);
      }

      console.log('📂 Nav Menu: Aberto');
    } else {
      // ============ FECHAMENTO ============
      openTl.current = gsap.timeline();

      if (prefersReducedMotion) {
        // Reduced motion: sem animações
        gsap.set(items, { y: 0 });
        gsap.set(logo, { x: 0 });
      } else {
        openTl.current
          // 1. Itens sobem (cascata reversa)
          .to([...items].reverse(), {
            y: 0,
            duration: 0.4,
            stagger: 0.06, // 60ms entre cada
            ease: 'power2.in'
          }, 0)
          // 2. Logo volta para posição original
          .to(logo, {
            x: 0,
            duration: 0.5,
            ease: 'power3.inOut'
          }, 0.3);
      }

      console.log('📁 Nav Menu: Fechado');
    }

    return () => {
      if (openTl.current) openTl.current.kill();
    };
  }, [isOpen]);

  // ================================
  // DETECÇÃO DE SEÇÃO ATIVA
  // ================================
  useEffect(() => {
    const sections = NAV_ITEMS
      .filter(item => item.type === 'anchor')
      .map(item => ({
        id: item.id,
        element: document.querySelector(item.href)
      }))
      .filter(s => s.element);

    if (sections.length === 0) {
      console.warn('⚠️ Nav Menu: Nenhuma seção encontrada');
      return;
    }

    // Observador de interseção
    const observerOptions = {
      threshold: [0, 0.5, 1],
      rootMargin: '-10% 0px -10% 0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const section = sections.find(s => s.element === entry.target);
          if (section) {
            setActiveSection(section.id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    sections.forEach(section => {
      observer.observe(section.element);
    });

    console.log('👁️ Nav Menu: Observando', sections.length, 'seções');

    return () => {
      observer.disconnect();
    };
  }, []);

  // ================================
  // HANDLERS
  // ================================
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((item) => {
    console.log('🔗 Nav Menu: Click em', item.label);

    // Fecha o menu
    setIsOpen(false);

    if (item.type === 'anchor' && item.href) {
      // Scroll suave para seção
      const target = document.querySelector(item.href);
      if (target) {
        // Delay para animação de fechamento
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 600); // Aguarda menu fechar
      }
    } else if (item.type === 'overlay' && item.id === 'about-me') {
      // Dispara evento para abrir AboutDrawer
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav:open-about-drawer'));
      }, 600);
    }
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // ================================
  // RENDER
  // ================================
  return (
    <nav
      ref={containerRef}
      className={`nav-menu-container ${isOpen ? 'open' : ''}`}
      aria-label="Main navigation"
    >
      {/* STACK: Logo + Todos os itens empilhados (mesma posição) */}
      <div className="nav-menu-stack">
        {/* LOGO (z-index: 10 - acima de tudo) */}
        <div ref={logoRef} className="nav-menu-logo">
          Spoonful
        </div>

        {/* ITENS (z-index decrescente: 9, 8, 7...) */}
        <ul
          ref={listRef}
          id="nav-menu-list"
          className="nav-menu-list"
          role="navigation"
        >
          {NAV_ITEMS.map((item, index) => {
            // Z-index: Home=9, About Us=8, What We Do=7...
            const zIndex = 9 - index;
            
            return (
              <li key={item.id} style={{ position: 'relative', height: 0 }}>
                <a
                  ref={el => itemsRef.current[index] = el}
                  href={item.href || '#'}
                  className={`nav-menu-item ${
                    activeSection === item.id ? 'active' : ''
                  }`}
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

      {/* HAMBURGER / X TOGGLE */}
      <button
        ref={toggleRef}
        className="nav-menu-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="nav-menu-list"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <svg
          className="nav-menu-icon"
          width="28"
          height="24"
          viewBox="0 0 28 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            className="nav-menu-icon-line"
            x1="4"
            y1="4"
            x2="24"
            y2="4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            className="nav-menu-icon-line"
            x1="4"
            y1="12"
            x2="24"
            y2="12"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            className="nav-menu-icon-line"
            x1="4"
            y1="20"
            x2="24"
            y2="20"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </nav>
  );
};

export default NavMenu;