// src/scripts/scroll-orchestrator.js
// CORREÇÃO CIRÚRGICA - Mantém animações originais, corrige bugs específicos

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Variáveis para armazenar Splitting e elementos
let heroCharsByLine = [];
let heroAllChars = [];
let clipRects = [];
let aboutChars = [];

// -----------------------------
// 1) Preparação: Splitting e gsap.set
// -----------------------------
function prepareSplitting() {
  const heroSplits = Splitting({ target: '.hero-content h2', by: 'chars' });
  heroCharsByLine = heroSplits.map(r => r.chars);
  heroAllChars = heroCharsByLine.flat();

  clipRects = gsap.utils.toArray('clipPath#heroClip rect');

  const aboutSplits = Splitting({ target: '#about-us .text-back', by: 'chars' });
  aboutChars = aboutSplits.flatMap(r => r.chars);

  // Perspectiva no Hero
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

  // Perspectiva no About Us
  aboutChars.forEach(char => 
    gsap.set(char.parentNode, { perspective: 1000 })
  );

  console.log('Splitting prepared:', {
    heroChars: heroAllChars.length,
    aboutChars: aboutChars.length,
    clipRects: clipRects.length
  });
}

// -----------------------------
// 2) Animação de entrada do Hero ao carregar a página
// -----------------------------
function animateHeroEntry() {
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
      console.log('Hero entry animation complete');
    }
  });

  // Animação por linha
  heroCharsByLine.forEach((chars, i) => {
    entryTl.to(chars, {
      opacity: 1,
      rotationX: 0,
      z: 0,
      ease: 'power2.out',
      stagger: 0.05,
      duration: 0.6,
      delay: i * 0.1
    }, i === 0 ? 0.5 : '<0.1');
  });

  return entryTl;
}

// -----------------------------
// 3) Timeline unificada para Hero + About Us atrelada ao scroll
// -----------------------------
function initHeroAboutTimeline() {
  const wrapper = document.querySelector('.intro-wrapper');
  const whatWeDo = document.querySelector('#what-we-do');
  
  if (!wrapper || !whatWeDo) {
    console.error('Required elements not found:', { wrapper: !!wrapper, whatWeDo: !!whatWeDo });
    return;
  }

  // Estados iniciais para About Us
  gsap.set(aboutChars, {
    scaleY: 0,
    opacity: 0,
    transformOrigin: '50% 100%'
  });

  console.log('Creating hero/about timeline...');

  // Timeline principal
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 3,
      onLeave: () => {
        gsap.set(whatWeDo, { autoAlpha: 1 });
      }
    }
  });

  mainTl
    .addLabel('start')
    .addLabel('heroExit', 0.3)
    .addLabel('aboutEnter', 0.5)
    
    // Saída do Hero
    .to(
      heroAllChars,
      {
        opacity: 0,
        rotationX: 90,
        z: -200,
        transformOrigin: '50% 100%',
        ease: 'power2.inOut',
        stagger: {
          each: 0.015,
          from: 'start'
        },
        duration: 0.4
      },
      'heroExit'
    )
    
    // Clip-path do Hero
    .to(
      clipRects,
      {
        attr: { y: 0.5, height: 0 },
        ease: 'power2.inOut',
        stagger: 0.04,
        duration: 0.5
      },
      'heroExit+=0.1'
    )
    
    // Entrada do About Us
    .to(
      aboutChars,
      {
        scaleY: 1,
        opacity: 1,
        ease: 'power3.out',
        stagger: {
          each: 0.02,
          from: 'start'
        },
        duration: 0.5
      },
      'aboutEnter'
    )
    
    // Pausa para leitura
    .to({}, { duration: 0.6 }, '+=0');

  console.log('Hero/About timeline created successfully');
}

// -----------------------------
// 4) Setup da seção What We Do
// -----------------------------
function setupWhatWeDoSection() {
  const section = document.querySelector('#what-we-do');
  const wrapper = document.querySelector('.what-we-do__wrapper');
  const rows = gsap.utils.toArray('.what-we-do__row');
  
  if (!section || !wrapper) {
    console.log('What We Do section elements not found');
    return;
  }
  
  console.log('Setting up What We Do section...');
  
  // Estado inicial: conteúdo invisível
  gsap.set(rows, { opacity: 0, y: 50 });
  
  // ScrollTrigger 1: Animação do conteúdo
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    once: true,
    refreshPriority: 2,
    invalidateOnRefresh: true,
    onEnter: () => {
      console.log('What We Do content animation triggered');
      
      if (rows.length > 0) {
        gsap.to(rows, {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    }
  });
  
  // ScrollTrigger 2: Pin da seção
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=200',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    refreshPriority: 2,
    invalidateOnRefresh: true,
    onLeave: () => {
      const work = document.querySelector('#work-mount-point');
      if (work) gsap.set(work, { autoAlpha: 1 });
    }
  });
}

// -----------------------------
// 5) Statement Section - Pin + Loop + Contact Control
// -----------------------------
function setupStatementSection() {
  const section = document.querySelector('#statement');
  const contact = document.querySelector('#contact');
  
  if (!section) {
    console.log('Statement section not found');
    return;
  }
  
  console.log('Setting up Statement section...');
  
  // ScrollTrigger: Pin da seção + controle do Contact
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=600',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    refreshPriority: 1,
    invalidateOnRefresh: true,
    
    onEnter: () => {
      console.log('📍 Statement: Pinned - iniciando loop');
      window.dispatchEvent(new CustomEvent('statement:start'));
      
      if (contact) {
        gsap.set(contact, {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1
        });
        console.log('📍 Contact: Fixed (atrás do Statement)');
      }
    },
    
    onLeave: () => {
      console.log('📍 Statement: Unpinned - parando loop');
      window.dispatchEvent(new CustomEvent('statement:stop'));
      
      if (contact) {
        gsap.set(contact, {
          position: 'relative',
          clearProps: 'top,left,width'
        });
        console.log('📍 Contact: Revelado (relative)');
      }
    },
    
    onEnterBack: () => {
      console.log('📍 Statement: Re-entered - iniciando loop');
      window.dispatchEvent(new CustomEvent('statement:start'));
      
      if (contact) {
        gsap.set(contact, {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1
        });
        console.log('📍 Contact: Fixed novamente');
      }
    },
    
    onLeaveBack: () => {
      console.log('📍 Statement: Left back - parando loop');
      window.dispatchEvent(new CustomEvent('statement:stop'));
      
      if (contact) {
        gsap.set(contact, {
          position: 'relative',
          clearProps: 'top,left,width'
        });
        console.log('📍 Contact: Relative novamente');
      }
    }
  });
}

// -----------------------------
// 6) Testimonials Section
// -----------------------------
function setupTestimonialsSection() {
  const section = document.querySelector('#testimonials');
  if (!section) return;
  
  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      console.log('Testimonials section ready');
    }
  });
}

// -----------------------------
// 7) Utilitários
// -----------------------------
let refreshScheduled = false;

function smartRefresh() {
  if (refreshScheduled) return;
  refreshScheduled = true;
  
  gsap.delayedCall(0.1, () => {
    ScrollTrigger.refresh(true);
    refreshScheduled = false;
    console.log('Smart refresh executed');
  });
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

function resetAnimations() {
  console.log('Resetting animations...');
  ScrollTrigger.getAll().forEach(st => st.kill());
  
  if (heroAllChars.length > 0) {
    gsap.set(heroAllChars, { clearProps: 'all' });
  }
  if (aboutChars.length > 0) {
    gsap.set(aboutChars, { clearProps: 'all' });
  }
}

// -----------------------------
// 8) Inicialização
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - preparing splitting...');
  prepareSplitting();
});

window.addEventListener('load', () => {
  console.log('Window loaded - starting animations...');
  
  const wrapper = document.querySelector('.intro-wrapper');
  if (!wrapper) {
    console.error('Intro wrapper not found!');
    return;
  }
  
  const viewport = window.innerHeight;
  wrapper.style.height = `${viewport}px`;

  animateHeroEntry();
  
  gsap.delayedCall(0.1, () => {
    initHeroAboutTimeline();
    setupWhatWeDoSection();
    setupStatementSection();
    setupTestimonialsSection();
  });
  
  gsap.delayedCall(0.5, smartRefresh);
  
  const handleResize = debounce(() => {
    console.log('Handling resize...');
    const newViewport = window.innerHeight;
    wrapper.style.height = `${newViewport}px`;
    smartRefresh();
  }, 300);
  
  window.addEventListener('resize', handleResize);
});

// -----------------------------
// 9) Debug mode
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  console.log('🐛 Debug mode ativo');
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    refresh: smartRefresh,
    reset: resetAnimations,
    timeline: () => ScrollTrigger.getAll()
  };
}

// Export
export { smartRefresh as refreshScrollTriggers, resetAnimations };

// Debug Kinetic
window.debugKinetic = () => {
  console.log('Kinetic debug info:', {
    workSection: document.querySelector('#work'),
    workTrack: document.querySelector('.work-track'),
  });
};