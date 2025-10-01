// src/scroll-orchestrator.js
// CORREÇÃO CIRÚRGICA - Mantém animações originais, corrige bugs específicos

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  setContactInteractivity, 
  focusFirstContactElement,
  revealContactElements 
} from '../utils/contact-interactivity.js';

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
// 2) Animação de entrada do Hero
// -----------------------------
function animateHeroEntry() {
  gsap.set(heroAllChars, {
    opacity: 0,
    rotationX: -90,
    z: -200,
    transformOrigin: '50% 0%'
  });

  const entryTl = gsap.timeline({
    onComplete: () => {
      console.log('Hero entry animation complete');
    }
  });

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
// 3) Timeline Hero + About Us
// -----------------------------
function initHeroAboutTimeline() {
  const wrapper = document.querySelector('.intro-wrapper');
  const whatWeDo = document.querySelector('#what-we-do');
  
  if (!wrapper || !whatWeDo) {
    console.error('Required elements not found:', { wrapper: !!wrapper, whatWeDo: !!whatWeDo });
    return;
  }

  gsap.set(aboutChars, {
    scaleY: 0,
    opacity: 0,
    transformOrigin: '50% 100%'
  });

  console.log('Creating hero/about timeline...');

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
    .to({}, { duration: 0.6 }, '+=0');

  console.log('Hero/About timeline created successfully');
}

// -----------------------------
// 4) What We Do Section
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
  
  gsap.set(rows, { opacity: 0, y: 50 });
  
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
// 5) Testimonials
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
// STATEMENT → CONTACT TRANSITION
// -----------------------------
if (!window.__statementContact) window.__statementContact = {};

function setupStatementContactTransition() {
  if (window.__statementContact.initialized) {
    console.warn('setupStatementContactTransition: já inicializado');
    return window.__statementContact.trigger;
  }

  const wrapper = document.querySelector('.statement-contact-wrapper');
  const statementLayer = document.querySelector('.statement-layer');
  const contactLayer = document.querySelector('.contact-layer');

  if (!wrapper || !statementLayer || !contactLayer) {
    console.warn('setupStatementContactTransition: elementos não encontrados');
    return null;
  }

  if (window.__statementContact.trigger?.kill) {
    try {
      window.__statementContact.trigger.kill();
    } catch {
      // ignore
    }
    window.__statementContact.trigger = null;
  }

  console.log('🎬 Setting up Statement → Contact transition...');

  gsap.set(statementLayer, { y: 0 });
  setContactInteractivity(false);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    const t = ScrollTrigger.create({
      id: 'stmt-contact-reduced',
      trigger: wrapper,
      start: 'top top',
      end: 'top top+=1',
      onEnter: () => {
        gsap.set(statementLayer, { yPercent: -100 });
        setContactInteractivity(true);
        window.dispatchEvent(new CustomEvent('statement:stop'));
        contactLayer.classList.add('contact--revealed');
      },
      onLeaveBack: () => {
        gsap.set(statementLayer, { yPercent: 0 });
        setContactInteractivity(false);
        contactLayer.classList.remove('contact--revealed');
        window.dispatchEvent(new CustomEvent('statement:start'));
      }
    });
    
    window.__statementContact.initialized = true;
    window.__statementContact.trigger = t;
    return t;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'stmt-contact-tl',
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2}`, // 2 scrolls de duração
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      refreshPriority: 0,
      invalidateOnRefresh: true,

      onEnter: () => {
        console.log('📍 Statement: Pinned - iniciando loop');
        window.dispatchEvent(new CustomEvent('statement:start'));
      },

      onLeave: () => {
        console.log('📍 Statement: Unpinned - parando loop + habilitando Contact');
        window.dispatchEvent(new CustomEvent('statement:stop'));
        setContactInteractivity(true);
        contactLayer.classList.add('contact--revealed');
        focusFirstContactElement();
      },

      onEnterBack: () => {
        console.log('📍 Statement: Re-entered - bloqueando Contact + reiniciando loop');
        setContactInteractivity(false);
        contactLayer.classList.remove('contact--revealed');
        window.dispatchEvent(new CustomEvent('statement:start'));
      },

      onLeaveBack: () => {
        console.log('📍 Statement: Left back - parando loop');
        window.dispatchEvent(new CustomEvent('statement:stop'));
      }
    }
  });

  tl.to(statementLayer, { y: '-100%', ease: 'none', duration: 1 }, 0);

  window.__statementContact.initialized = true;
  window.__statementContact.trigger = tl.scrollTrigger;

  console.log('✅ Statement → Contact transition configured');
  return tl.scrollTrigger;
}

// HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const t = window.__statementContact?.trigger;
    if (t?.kill) t.kill();
    window.__statementContact = {};
  });
}

// -----------------------------
// 6) Utilitários
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
// 7) Inicialização
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
    setupStatementContactTransition();
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
// 8) Debug mode
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  console.log('🐛 Debug mode ativo');
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    refresh: smartRefresh,
    reset: resetAnimations,
    timeline: () => ScrollTrigger.getAll(),
    contact: {
      enable: () => setContactInteractivity(true),
      disable: () => setContactInteractivity(false),
      focus: () => focusFirstContactElement(),
      reveal: () => revealContactElements()
    }
  };
}

export { smartRefresh as refreshScrollTriggers, resetAnimations };

window.debugKinetic = () => {
  console.log('Kinetic debug info:', {
    workSection: document.querySelector('#work'),
    workTrack: document.querySelector('.work-track'),
  });
};