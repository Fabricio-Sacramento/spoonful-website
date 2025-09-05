// src/scroll-orchestrator.js
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
    .to({}, { duration: 0.3 }, '+=0');

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
  
  // Inicialmente escondido (MANTIDO ORIGINAL)
  gsap.set(section, { autoAlpha: 0 });
  
  // CORREÇÃO #3: ScrollTrigger com refreshPriority e pinSpacing ajustado
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin: true,
    pinSpacing: false, // CORREÇÃO: Evita acúmulo de spacing
    anticipatePin: 1,
    refreshPriority: 2, // CORREÇÃO: Prioridade média
    invalidateOnRefresh: true,
    onEnter: () => {
      console.log('What We Do section entering viewport');
      
      // Animações MANTIDAS ORIGINAIS
      gsap.to(section, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.out'
      });
      
      if (rows.length > 0) {
        gsap.fromTo(rows, 
          {
            y: 50,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.2
          }
        );
      }
    },
    onLeave: () => {
      // CORREÇÃO: Prepara próxima seção
      const work = document.querySelector('#work');
      if (work) gsap.set(work, { autoAlpha: 1 });
    }
  });
}

// -----------------------------
// 5) WORK – scroll horizontal com clamp e pin estável (CORRIGIDA)
// -----------------------------
function setupWorkSectionHorizontal() {
  const work = document.querySelector('#work');
  if (!work) return;

  const track = work.querySelector('.work-track');
  if (!track) return;

  const mq = window.matchMedia('(min-width: 1024px)');
  let st = null;
  let horizontalAnimation = null;

  // Função para calcular distância (MANTIDA ORIGINAL)
  const getDistance = () => {
    const fullWidth = track.scrollWidth || 0;
    const containerWidth = work.clientWidth || 0;
    return Math.max(1, fullWidth - containerWidth);
  };

  const enable = () => {
    gsap.set(track, { x: 0 });

    horizontalAnimation = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      paused: true,
    });

    // CORREÇÃO #4: refreshPriority baixa e pinSpacing ajustado
    st = ScrollTrigger.create({
      trigger: work,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      pinSpacing: false, // CORREÇÃO: Evita spacing extra
      anticipatePin: 1,
      scrub: true,
      animation: horizontalAnimation,
      invalidateOnRefresh: true,
      refreshPriority: 1, // CORREÇÃO: Prioridade baixa
      onKill: () => {
        gsap.set(track, { x: 0 });
      },
    });

    // Refresh apenas se necessário (OTIMIZADO)
    const imgs = work.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', () => smartRefresh(), { once: true });
        img.addEventListener('error', () => smartRefresh(), { once: true });
      }
    });
  };

  const disable = () => {
    if (st) {
      st.kill();
      st = null;
    }
    if (horizontalAnimation) {
      horizontalAnimation.kill();
      horizontalAnimation = null;
    }
    gsap.set(track, { clearProps: 'transform' });
    smartRefresh();
  };

  const apply = () => (mq.matches ? enable() : disable());
  apply();

  mq.addEventListener('change', apply);

  window.addEventListener('resize', () => {
    if (st) st.refresh();
  });
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
    setupWorkSectionHorizontal();
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