// src/scroll-orchestrator.js
// CORREÇÃO CIRÚRGICA - Mantém animações originais, corrige bugs específicos

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import KineticWorkScroll from './kinetic-work-scroll.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Variáveis para armazenar Splitting e elementos
let heroCharsByLine = [];
let heroAllChars = [];
let clipRects = [];
let aboutChars = [];

// CORREÇÃO #1: Removido isHeroAnimationComplete (dependência circular)
// As animações agora são independentes

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

  // Perspectiva no Hero (MANTIDA ORIGINAL)
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

  // Perspectiva no About Us (MANTIDA ORIGINAL)
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
// 2) Animação de entrada do Hero ao carregar a página (MANTIDA ORIGINAL)
// -----------------------------
function animateHeroEntry() {
  // Estado inicial dos caracteres (MANTIDO ORIGINAL)
  gsap.set(heroAllChars, {
    opacity: 0,
    rotationX: -90,
    z: -200,
    transformOrigin: '50% 0%'
  });

  // Timeline de entrada (MANTIDA ORIGINAL - apenas removida dependência)
  const entryTl = gsap.timeline({
    onComplete: () => {
      console.log('Hero entry animation complete');
      // CORREÇÃO: Removida dependência circular
      // Animações de scroll já estão configuradas independentemente
    }
  });

  // Animação por linha (MANTIDA ORIGINAL)
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
// 3) Timeline unificada para Hero + About Us atrelada ao scroll (CORRIGIDA)
// -----------------------------
function initHeroAboutTimeline() {
  const wrapper = document.querySelector('.intro-wrapper');
  const whatWeDo = document.querySelector('#what-we-do');
  
  if (!wrapper || !whatWeDo) {
    console.error('Required elements not found:', { wrapper: !!wrapper, whatWeDo: !!whatWeDo });
    return;
  }

  // Estados iniciais para About Us (MANTIDOS ORIGINAIS)
  gsap.set(aboutChars, {
    scaleY: 0,
    opacity: 0,
    transformOrigin: '50% 100%'
  });

  console.log('Creating hero/about timeline...');

  // CORREÇÃO #2: Timeline principal com refreshPriority para evitar conflitos
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
      refreshPriority: 3, // CORREÇÃO: Prioridade alta para evitar conflitos
      // markers: true // Descomente para debug
      onLeave: () => {
        // CORREÇÃO: Prepara próxima seção suavemente
        gsap.set(whatWeDo, { autoAlpha: 1 });
      }
    }
  });

  // ANIMAÇÕES MANTIDAS EXATAMENTE ORIGINAIS
  mainTl
    .addLabel('start')
    .addLabel('heroExit', 0.3) // Hero começa a sair em 30% do scroll
    .addLabel('aboutEnter', 0.5) // About entra em 50% do scroll
    
    // ===== SAÍDA DO HERO (ORIGINAL) =====
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
    
    // Clip-path do Hero (ORIGINAL)
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
    
    // ===== ENTRADA DO ABOUT US (ORIGINAL) =====
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
    
    // Pausa para leitura do About Us (ORIGINAL)
    .to({}, { duration: 0.6 }, '+=0');

  console.log('Hero/About timeline created successfully');
}

// -----------------------------
// 4) Setup da seção What We Do (CORRIGIDA)
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
  
  // ScrollTrigger 1: Animação do conteúdo (quando topo passa pelo centro)
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
  
  // ScrollTrigger 2: Pin da seção (pausa para leitura)
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=200', // 2 wheel scrolls de pausa
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    refreshPriority: 2,
    invalidateOnRefresh: true,
    onLeave: () => {
      const work = document.querySelector('#work');
      if (work) gsap.set(work, { autoAlpha: 1 });
    }
  });
}

// -----------------------------
// 5) WORK – scroll horizontal com clamp e pin estável (CORRIGIDA)
// -----------------------------
function setupWorkSectionKinetic() {
  console.log('🎬 Iniciando setup da seção Work com Kinetic Scroll...');
  const kinetic = new KineticWorkScroll();
  kinetic.init();
  window.workKineticInstance = kinetic;
}

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
// 6) Utilitários (CORRIGIDOS)
// -----------------------------

// CORREÇÃO #5: Smart Refresh - evita múltiplos refreshes desnecessários
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
// 7) Inicialização (CORRIGIDA)
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

  // CORREÇÃO #6: Setup independente das animações
  // Não há mais dependência circular
  
  // Inicia animação de entrada do Hero
  animateHeroEntry();
  
  // Setup todas as seções de scroll independentemente
  // Pequeno delay para garantir que o DOM está pronto
  gsap.delayedCall(0.1, () => {
    initHeroAboutTimeline();
    setupWhatWeDoSection();
    setupWorkSectionKinetic();
    setupTestimonialsSection();
  });
  
  // CORREÇÃO #7: Um único refresh inteligente
  gsap.delayedCall(0.5, smartRefresh);
  
  // Listener para resize (OTIMIZADO)
  const handleResize = debounce(() => {
    console.log('Handling resize...');
    const newViewport = window.innerHeight;
    wrapper.style.height = `${newViewport}px`;
    smartRefresh();
  }, 300);
  
  window.addEventListener('resize', handleResize);
});

// -----------------------------
// 8) Debug mode (MANTIDO ORIGINAL)
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

// Export (MANTIDO ORIGINAL)
export { smartRefresh as refreshScrollTriggers, resetAnimations };