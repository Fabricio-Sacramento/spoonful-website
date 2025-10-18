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
  // ANIMAÇÃO DE ENTRADA (Page Load)
  // ================================
  useEffect(() => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const logo = logoRef.current;
    const toggle = toggleRef.current;
    const items = itemsRef.current.filter(Boolean);

    if (!logo || !toggle) return;

    gsap.set(items, { 
      y: 0, 
      opacity: 0,
      visibility: 'visible'
    });

    console.log('🎬 Nav Menu: Itens inicializados (invisíveis):', items.length);

    gsap.set(logo, { x: 200, opacity: 0 });
    gsap.set(toggle, { x: 100, opacity: 0 });

    entryTl.current = gsap.timeline({ delay: 0.5 });

    entryTl.current
      .to(logo, {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
      }, 0)
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

    if (openTl.current) openTl.current.kill();

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (isOpen) {
      // ============ ABERTURA - LÓGICA DA ÂNCORA ============
      openTl.current = gsap.timeline({
        onStart: () => {
          console.log('🎬 Animação ÂNCORA iniciada');
        }
      });

      const movingItems = items.slice(1); // Todos exceto Home

      if (prefersReducedMotion) {
        gsap.set(items, { opacity: 1 });
        gsap.set(logo, { x: -135 });
        movingItems.forEach((item, i) => {
          gsap.set(item, { y: (i + 1) * 48 });
        });
      } else {
        // ✅ TODOS EMPILHADOS NA ÂNCORA (posição do Home)
        gsap.set(movingItems, { y: 0 });

        openTl.current
          .set(items, { opacity: 1 }, 0)
          .to(logo, {
            x: -135,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Home revelado (âncora)')
          }, 0)
          
          // ✅ MÁXIMA: posição inicial = posição final do anterior
          
          // Step 1: About Us (0 → 48), resto fica em 0
          .set(movingItems.slice(1), { y: 0 }, 0.3) // What We Do até About Me ficam na âncora
          .to(movingItems.slice(0, 1), { // só About Us
            y: 48,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ About Us revelado')
          }, 0.3)
          
          // Step 2: What We Do (48 → 96), resto vai para 48
          .set(movingItems.slice(1, 2), { y: 48 }, 0.45) // What We Do vai para posição do About Us
          .set(movingItems.slice(2), { y: 48 }, 0.45) // Work até About Me vão para posição do About Us
          .to(movingItems.slice(1, 2), { // só What We Do
            y: 96,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ What We Do revelado')
          }, 0.45)
          
          // Step 3: Work (96 → 144), resto vai para 96
          .set(movingItems.slice(2, 3), { y: 96 }, 0.6) // Work vai para posição do What We Do
          .set(movingItems.slice(3), { y: 96 }, 0.6) // Statement até About Me vão para posição do What We Do
          .to(movingItems.slice(2, 3), { // só Work
            y: 144,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Work revelado')
          }, 0.6)
          
          // Step 4: Statement (144 → 192), resto vai para 144
          .set(movingItems.slice(3, 4), { y: 144 }, 0.75) // Statement vai para posição do Work
          .set(movingItems.slice(4), { y: 144 }, 0.75) // Contact + About Me vão para posição do Work
          .to(movingItems.slice(3, 4), { // só Statement
            y: 192,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Statement revelado')
          }, 0.75)
          
          // Step 5: Contact (192 → 240), About Me vai para 192
          .set(movingItems.slice(4, 5), { y: 192 }, 0.9) // Contact vai para posição do Statement
          .set(movingItems.slice(5), { y: 192 }, 0.9) // About Me vai para posição do Statement
          .to(movingItems.slice(4, 5), { // só Contact
            y: 240,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ Contact revelado')
          }, 0.9)
          
          // Step 6: About Me (240 → 288)
          .set(movingItems.slice(5, 6), { y: 240 }, 1.05) // About Me vai para posição do Contact
          .to(movingItems.slice(5, 6), { // só About Me
            y: 288,
            duration: 0.18,
            ease: 'power3.out',
            onComplete: () => console.log('✅ About Me revelado - ÂNCORA COMPLETA!')
          }, 1.05);
      }

      console.log('📂 Nav Menu: Aberto');
    } else {
      // ============ FECHAMENTO - CORTINA REVERSA ============
      
      openTl.current = gsap.timeline(); // ← Sem onComplete

      const movingItems = items.slice(1);

      if (prefersReducedMotion) {
        gsap.set(movingItems, { y: 0 });
        gsap.set(logo, { x: 0 });
        gsap.set(items, { opacity: 0 });
      } else {
        openTl.current
          // ✅ REAGRUPAMENTO PROGRESSIVO - grupos crescentes sobem juntos
          
          // Step 1: About Me vai para trás do Contact (só 1 item)
          .to(movingItems.slice(5, 6), { // só About Me
            y: 240,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ About Me atrás do Contact')
          }, 0)
          
          // Step 2: About Me + Contact sobem para trás do Statement (2 itens juntos)
          .to(movingItems.slice(4, 6), { // Contact + About Me
            y: 192,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ Contact + About Me atrás do Statement')
          }, 0.15)
          
          // Step 3: About Me + Contact + Statement sobem para trás do Work (3 itens juntos)
          .to(movingItems.slice(3, 6), { // Statement + Contact + About Me
            y: 144,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ Statement + Contact + About Me atrás do Work')
          }, 0.3)
          
          // Step 4: About Me + Contact + Statement + Work sobem para trás do What We Do (4 itens juntos)
          .to(movingItems.slice(2, 6), { // Work + Statement + Contact + About Me
            y: 96,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ Work + Statement + Contact + About Me atrás do What We Do')
          }, 0.45)
          
          // Step 5: Todos (exceto About Us) sobem para trás do About Us (5 itens juntos)
          .to(movingItems.slice(1, 6), { // What We Do + Work + Statement + Contact + About Me
            y: 48,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ Todos atrás do About Us')
          }, 0.6)
          
          // Step 6: TODOS sobem para âncora (6 itens juntos)
          .to(movingItems.slice(0, 6), { // About Us + What We Do + Work + Statement + Contact + About Me
            y: 0,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => console.log('✅ REAGRUPAMENTO COMPLETO - todos na âncora!')
          }, 0.75)
          
          .to(logo, {
            x: 0,
            duration: 0.5,
            ease: 'power3.inOut',
            onComplete: () => console.log('✅ Logo voltou')
          }, 0.3)
          
          .set(items, { opacity: 0 }, 0.93); // ← Timing mantido: 0.75 + 0.18 = 0.93s
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

    setIsOpen(false);

    if (item.type === 'anchor' && item.href) {
      const target = document.querySelector(item.href);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 600);
      }
    } else if (item.type === 'overlay' && item.id === 'about-me') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav:open-about-drawer'));
      }, 600);
    }
  }, []);

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
      <div className="nav-menu-stack">
        <div ref={logoRef} className="nav-menu-logo">
          Spoonful
        </div>

        <ul
          ref={listRef}
          id="nav-menu-list"
          className="nav-menu-list"
          role="navigation"
        >
          {NAV_ITEMS.map((item, index) => {
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