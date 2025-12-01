// src/scroll-orchestrator.js
// CORREÇÃO CIRÚRGICA - Mantém animações originais, corrige bugs específicos

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  setContactInteractivity, 
  focusFirstContactElement
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

  // Mobile: Setup simples sem transforms 3D
  const isMobile = window.innerWidth <= 1023;
  
  if (isMobile) {
    console.log('📱 Mobile: Animações simplificadas ativadas');
    gsap.set(heroAllChars, { opacity: 1 });
    gsap.set(aboutChars, { opacity: 1 });
    return;
  }

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

}

// -----------------------------
// 2) Animação de entrada do Hero
// -----------------------------
function animateHeroEntry() {
  const isMobile = window.innerWidth <= 1023;
  
  // Mobile: Animação simples de fade
  if (isMobile) {
    gsap.set(heroAllChars, { opacity: 0 });
    
    const entryTl = gsap.timeline({ paused: true });
    
    entryTl.to(heroAllChars, {
      opacity: 1,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power2.out'
    });
    
    window.addEventListener('preloader:complete', () => {
      entryTl.play();
    }, { once: true });
    
    return entryTl;
  }
  
  // Desktop: Animação 3D completa
  gsap.set(heroAllChars, {
    opacity: 0,
    rotationX: -90,
    z: -200,
    transformOrigin: '50% 0%'
  });

  const entryTl = gsap.timeline({
    paused: true,
    onComplete: () => {
      console.log('✅ Hero entry animation complete');
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

  window.addEventListener('preloader:complete', () => {
    entryTl.play();
  }, { once: true });

  return entryTl;
}

// -----------------------------
// 3) Timeline Hero + About Us
// -----------------------------
function initHeroAboutTimeline() {
  const isMobile = window.innerWidth <= 1023;
  if (isMobile) {
    console.log('📱 Mobile: Timeline desabilitada - scroll nativo ativo');
    return;
  }
  
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


  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: 'bottom top',
      scrub: 2.5,
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
    .addLabel('heroExit', 0.4)
    .addLabel('aboutEnter', 0.7)
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

}

// -----------------------------
// 4) What We Do Section
// -----------------------------
function setupWhatWeDoSection() {
  const section = document.querySelector('#what-we-do');
  const wrapper = document.querySelector('.what-we-do__wrapper');
  const rows = gsap.utils.toArray('.what-we-do__row');
  
  if (!section || !wrapper) {
    return;
  }
  
  
  gsap.set(rows, { opacity: 0, y: 50 });
  
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    once: true,
    refreshPriority: 2,
    invalidateOnRefresh: true,
    onEnter: () => {
      
      if (rows.length > 0) {
        gsap.to(rows, {
          y: 0,
          opacity: 1,
          stagger: 0.25,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    }
  });
  
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=600',
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
      console.log('📣 Testimonials entered viewport');
    }
  });
}

// -----------------------------
// STATEMENT SECTION (standalone - caso não tenha wrapper)
// -----------------------------
function setupStatementSection() {
  // Se wrapper existe, delega para setupStatementContactTransition
  if (document.querySelector('.statement-contact-wrapper')) {
    return;
  }
  
  const section = document.querySelector('#statement');
  
  if (!section) {
    return;
  }
  
  
  ScrollTrigger.create({
    id: 'statement-pin',
    trigger: section,
    start: 'top top',
    end: '+=600',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    refreshPriority: 1,
    invalidateOnRefresh: true,
    
    onEnter: () => {
      window.dispatchEvent(new CustomEvent('statement:start'));
    },
    
    onLeave: () => {
      window.dispatchEvent(new CustomEvent('statement:stop'));
    },
    
    onEnterBack: () => {
      window.dispatchEvent(new CustomEvent('statement:start'));
    },
    
    onLeaveBack: () => {
      window.dispatchEvent(new CustomEvent('statement:stop'));
    }
  });
}

// -----------------------------
// STATEMENT → CONTACT TRANSITION (com timeline como Hero/About)
// -----------------------------
function setupStatementContactTransition() {
  const wrapper = document.querySelector('.statement-contact-wrapper');
  const statementLayer = document.querySelector('.statement-layer');
  const contactLayer = document.querySelector('.contact-layer');
  
  if (!wrapper || !statementLayer || !contactLayer) {
    console.warn('Statement/Contact wrapper não encontrado');
    return;
  }
  
  
  // Estado inicial
  setContactInteractivity(false);
  
  // Timeline com scrub (igual Hero/About)
  const mainTl = gsap.timeline({
    scrollTrigger: {
      id: 'statement-contact-tl',
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2}`, // 2 scrolls
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 0,
      
      onEnter: () => {
        window.dispatchEvent(new CustomEvent('statement:start'));
      },
      
      onUpdate: (self) => {
        // Para o loop quando começa a subir (50% do scroll)
        if (self.progress > 0.5 && self.direction === 1) {
          window.dispatchEvent(new CustomEvent('statement:stop'));
        }
      },
      
      onLeave: () => {
        window.dispatchEvent(new CustomEvent('statement:stop'));
        setContactInteractivity(true);
        contactLayer.classList.add('contact--revealed');
        focusFirstContactElement();
      },
      
      onEnterBack: () => {
        setContactInteractivity(false);
        contactLayer.classList.remove('contact--revealed');
        window.dispatchEvent(new CustomEvent('statement:start'));
      },
      
      onLeaveBack: () => {
        window.dispatchEvent(new CustomEvent('statement:stop'));
      }
    }
  });
  
  // Animação: Statement sobe (igual Hero sai)
  mainTl
    .addLabel('start')
    .addLabel('statementExit', 0.5) // Statement começa a sair em 50%
    .to(
      statementLayer,
      {
        y: '-100%',
        ease: 'power2.inOut',
        duration: 0.5
      },
      'statementExit'
    );
  
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
  prepareSplitting();
});

window.addEventListener('load', () => {
  
  const wrapper = document.querySelector('.intro-wrapper');
  if (!wrapper) {
    console.error('Intro wrapper not found!');
    return;
  }
  
  const isMobile = window.innerWidth <= 1023;
  
  if (!isMobile) {
    const viewport = window.innerHeight;
    wrapper.style.height = `${viewport}px`;
  }

  animateHeroEntry();
  
  gsap.delayedCall(0.1, () => {
    initHeroAboutTimeline();
    setupWhatWeDoSection();
    setupStatementSection();
    setupStatementContactTransition();
    setupTestimonialsSection();
  });
  
  gsap.delayedCall(0.5, smartRefresh);
  
  const handleResize = debounce(() => {
    const newIsMobile = window.innerWidth <= 1023;
    
    if (!newIsMobile) {
      const newViewport = window.innerHeight;
      wrapper.style.height = `${newViewport}px`;
    } else {
      wrapper.style.height = 'auto';
    }
    
    smartRefresh();
  }, 300);
  
  window.addEventListener('resize', handleResize);
});

// -----------------------------
// 8) Debug mode
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    refresh: smartRefresh,
    reset: resetAnimations,
    timeline: () => ScrollTrigger.getAll(),
    contact: {
      enable: () => setContactInteractivity(true),
      disable: () => setContactInteractivity(false),
      focus: () => focusFirstContactElement()
    }
  };
}

export { smartRefresh as refreshScrollTriggers, resetAnimations };

window.debugKinetic = () => {
  console.log('Kinetic scroll debug removed - native scroll on mobile');
};