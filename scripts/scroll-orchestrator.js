// src/scroll-orchestrator-refactored.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Variáveis para elementos
let heroCharsByLine = [];
let heroAllChars = [];
let clipRects = [];
let aboutChars = [];

// -----------------------------
// 1) Preparação: Splitting e gsap.set
// -----------------------------
function prepareSplitting() {
  // Hero splitting
  const heroSplits = Splitting({ target: '.hero-content [data-splitting]', by: 'chars' });
  if (heroSplits.length > 0) {
    heroCharsByLine = heroSplits.map(result => result.chars);
    heroAllChars = heroCharsByLine.flat();
  }

  // Clip path rects
  clipRects = gsap.utils.toArray('clipPath#heroClip rect');

  // About splitting
  const aboutSplits = Splitting({ target: '.about-text[data-splitting]', by: 'chars' });
  if (aboutSplits.length > 0) {
    aboutChars = aboutSplits.flatMap(result => result.chars);
  }

  // Setup 3D perspective para Hero
  heroAllChars.forEach(char => {
    gsap.set(char.parentNode, { 
      perspective: 1000,
      transformStyle: 'preserve-3d'
    });
    gsap.set(char, {
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'visible'
    });
  });

  // Setup perspective para About
  aboutChars.forEach(char => {
    gsap.set(char.parentNode, { perspective: 1000 });
  });

  console.log('✅ Splitting prepared:', {
    heroChars: heroAllChars.length,
    aboutChars: aboutChars.length,
    clipRects: clipRects.length
  });
}

// -----------------------------
// 2) Animação de entrada do Hero (load da página)
// -----------------------------
function animateHeroEntry() {
  if (heroAllChars.length === 0) {
    console.warn('⚠️ No hero chars found for animation');
    return gsap.timeline();
  }

  // Estado inicial dos caracteres
  gsap.set(heroAllChars, {
    opacity: 0,
    rotationX: -90,
    z: -200,
    transformOrigin: '50% 0%'
  });

  // Timeline de entrada
  const entryTl = gsap.timeline({
    onComplete: () => {
      console.log('✅ Hero entry animation complete');
    }
  });

  // Anima cada linha com stagger
  heroCharsByLine.forEach((chars, lineIndex) => {
    entryTl.to(chars, {
      opacity: 1,
      rotationX: 0,
      z: 0,
      ease: 'power2.out',
      stagger: 0.05,
      duration: 0.6,
      delay: lineIndex * 0.1
    }, lineIndex === 0 ? 0.5 : '<0.1');
  });

  return entryTl;
}

// -----------------------------
// 3) ScrollTrigger para transição Hero → About
// -----------------------------
function setupHeroToAboutTransition() {
  const heroSection = document.querySelector('#hero');
  const aboutSection = document.querySelector('#about-us');
  
  if (!heroSection || !aboutSection) {
    console.error('❌ Hero or About section not found');
    return;
  }

  // Estados iniciais para About Us
  if (aboutChars.length > 0) {
    gsap.set(aboutChars, {
      scaleY: 0,
      opacity: 0,
      transformOrigin: '50% 100%'
    });
  }

  console.log('🔄 Setting up Hero → About transition...');

  // ScrollTrigger para Hero (saída)
  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: 'bottom top',
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    // markers: true, // descomente para debug
    onUpdate: (self) => {
      const progress = self.progress;
      
      // Hero fade out + 3D rotation
      if (heroAllChars.length > 0) {
        gsap.to(heroAllChars, {
          opacity: gsap.utils.mapRange(0, 0.7, 1, 0, progress),
          rotationX: gsap.utils.mapRange(0, 0.7, 0, 90, progress),
          z: gsap.utils.mapRange(0, 0.7, 0, -200, progress),
          transformOrigin: '50% 100%',
          duration: 0.1,
          overwrite: true
        });
      }

      // Clip-path animation
      if (clipRects.length > 0) {
        const clipProgress = gsap.utils.mapRange(0.3, 1, 0, 1, progress);
        clipRects.forEach((rect, i) => {
          const staggeredProgress = Math.max(0, clipProgress - (i * 0.1));
          gsap.set(rect, {
            attr: { 
              y: gsap.utils.mapRange(0, 1, 0, 0.5, staggeredProgress),
              height: gsap.utils.mapRange(0, 1, 1, 0, staggeredProgress)
            }
          });
        });
      }
    }
  });

  // ScrollTrigger para About (entrada)
  ScrollTrigger.create({
    trigger: aboutSection,
    start: 'top center',
    end: 'center center',
    scrub: 1,
    invalidateOnRefresh: true,
    // markers: true, // descomente para debug
    onEnter: () => {
      console.log('📝 About section entering...');
      
      if (aboutChars.length > 0) {
        gsap.to(aboutChars, {
          scaleY: 1,
          opacity: 1,
          ease: 'power3.out',
          stagger: {
            each: 0.02,
            from: 'start'
          },
          duration: 1.2
        });
      }
    }
  });
}

// -----------------------------
// 4) Setup What We Do (placeholder para próxima etapa)
// -----------------------------
function setupWhatWeDoSection() {
  const section = document.querySelector('#what-we-do');
  
  if (!section) {
    console.log('⏩ What We Do section not found - skipping');
    return;
  }
  
  // Por enquanto só um log - será implementado na Etapa 3
  console.log('⏸️ What We Do setup - aguardando Etapa 3');
}

// -----------------------------
// 5) Utilities
// -----------------------------
function refreshScrollTriggers() {
  console.log('🔄 Refreshing ScrollTriggers...');
  ScrollTrigger.refresh(true);
}

function resetAnimations() {
  console.log('🔄 Resetting animations...');
  ScrollTrigger.getAll().forEach(st => st.kill());
  
  if (heroAllChars.length > 0) {
    gsap.set(heroAllChars, { clearProps: 'all' });
  }
  if (aboutChars.length > 0) {
    gsap.set(aboutChars, { clearProps: 'all' });
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// -----------------------------
// 6) Inicialização
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded - preparing splitting...');
  prepareSplitting();
});

window.addEventListener('load', () => {
  console.log('🚀 Window loaded - starting animations...');
  
  // Inicia animação de entrada do Hero
  animateHeroEntry();
  
  // Setup da transição Hero → About após pequeno delay
  gsap.delayedCall(0.8, () => {
    setupHeroToAboutTransition();
    setupWhatWeDoSection();
  });
  
  // Refresh para garantir cálculos corretos
  gsap.delayedCall(1.0, refreshScrollTriggers);
  
  // Listener para resize
  const handleResize = debounce(() => {
    console.log('📱 Handling resize...');
    refreshScrollTriggers();
  }, 300);
  
  window.addEventListener('resize', handleResize);
});

// -----------------------------
// 7) Debug mode
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  console.log('🐛 Debug mode active');
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    refresh: refreshScrollTriggers,
    reset: resetAnimations,
    triggers: () => ScrollTrigger.getAll()
  };
}

// Exports
export { refreshScrollTriggers, resetAnimations };