// src/scroll-orchestrator.js

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
let isHeroAnimationComplete = false;
let whatWeDoReady = false;

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
      isHeroAnimationComplete = true;
      console.log('Hero entry animation complete');
      // Inicia as animações de scroll após um pequeno delay
      gsap.delayedCall(0.1, initHeroAboutTimeline);
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
// 3) Timeline unificada para Hero + About Us atrelada ao scroll
// -----------------------------
function initHeroAboutTimeline() {
  if (!isHeroAnimationComplete) {
    console.log('Waiting for hero animation to complete...');
    return;
  }

  const wrapper = document.querySelector('.intro-wrapper');
  const whatWeDo = document.querySelector('#what-we-do');
  
  if (!wrapper || !whatWeDo) {
    console.error('Required elements not found:', { wrapper: !!wrapper, whatWeDo: !!whatWeDo });
    return;
  }
  
  // 🔧 CORREÇÃO: Estados iniciais mais consistentes
  gsap.set(whatWeDo, { 
    opacity: 1,
    visibility: 'visible'
  });
  
  // Estados iniciais para About Us (escondido)
  gsap.set(aboutChars, {
    scaleY: 0,
    opacity: 0,
    transformOrigin: '50% 100%'
  });
  
  console.log('Creating hero/about timeline...');
  
  // Timeline principal do Hero + About
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
      // markers: true, // Descomente para debug
      onComplete: () => {
        console.log('Hero/About timeline complete');
        whatWeDoReady = true;
        // 🔧 CORREÇÃO: Força refresh do próximo ScrollTrigger
        gsap.delayedCall(0.1, () => {
          ScrollTrigger.refresh();
        });
      },
      onLeave: () => {
        console.log('Hero/About section left - preparing What We Do');
        whatWeDoReady = true;
      }
    }
  });

  mainTl
    .addLabel('start')
    .addLabel('heroExit', 0.3) // Hero começa a sair em 30% do scroll
    .addLabel('aboutEnter', 0.5) // About entra em 50% do scroll
    
    // ===== SAÍDA DO HERO =====
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
    
    // ===== ENTRADA DO ABOUT US =====
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
    
    // Pausa para leitura do About Us
    .to({}, { duration: 0.3 }, '+=0');

  console.log('Hero/About timeline created successfully with', aboutChars.length, 'about chars');
}

// -----------------------------
// 4) Setup da seção What We Do
// -----------------------------
function setupWhatWeDoSection() {
  const section = document.querySelector('#what-we-do');
  const rows = gsap.utils.toArray('.what-we-do__row');
  
  if (!section) return;

  // 🔧 CORREÇÃO: Estado inicial mais claro
  gsap.set(section, { 
    opacity: 1,
    visibility: 'visible'
  });

  gsap.set(rows, {
    y: 50,
    opacity: 0
  });

  // Timeline dedicada para reveal
  const revealTl = gsap.timeline({ paused: true })
    .to(rows, {
      y: 0,
      opacity: 1,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });

  ScrollTrigger.create({
    id: 'whatWeDo',
    trigger: section,
    start: 'top center+=10%',
    end: 'bottom bottom',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    // markers: true, // Descomente para debug
    onEnter: () => {
      console.log('What We Do entered');
      if (whatWeDoReady) {
        revealTl.play();
      }
    },
    onEnterBack: () => {
      console.log('What We Do entered back');
      revealTl.play();
    },
    onLeave: () => {
      console.log('What We Do left');
    },
    onLeaveBack: () => {
      console.log('What We Do left back');
    },
    onRefresh: self => {
      console.log('What We Do refreshed, progress:', self.progress);
      if (self.progress > 0 && whatWeDoReady) {
        revealTl.progress(1);
      }
    }
  });
}

// -----------------------------
// 5) Outras seções
// -----------------------------
function setupWorkSectionHorizontal() {
  const work = document.querySelector("#work");
  if (!work) return;

  const track = work.querySelector(".work-track");
  if (!track) return;

  const getDistance = () => {
    const fullWidth = track.scrollWidth;
    const containerWidth = work.offsetWidth;
    const distance = fullWidth - containerWidth;
    
    console.log('Work section measurements:', {
      fullWidth,
      containerWidth,
      distance
    });
    
    return Math.max(0, distance); // 🔧 CORREÇÃO: Evita valores negativos
  };

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    // Reset and prepare section
    gsap.set(work, { 
      overflow: "hidden",
      height: "100vh"
    });
    gsap.set(track, { 
      x: 0,
      willChange: "transform"
    });

    // 🔧 CORREÇÃO: Verifica se há conteúdo suficiente para scroll horizontal
    const distance = getDistance();
    
    if (distance <= 0) {
      console.log('Not enough content for horizontal scroll');
      return;
    }

    // Create the horizontal animation
    const horizontalAnimation = gsap.to(track, {
      x: -distance,
      ease: "none",
      paused: true
    });

    // Create ScrollTrigger with the animation
    const st = ScrollTrigger.create({
      trigger: work,
      start: "top top",
      end: `+=${distance * 2}`, // 🔧 CORREÇÃO: Ajuste mais conservador
      pin: true,
      anticipatePin: 1,
      scrub: 1, // 🔧 CORREÇÃO: Scrub menos agressivo
      animation: horizontalAnimation,
      invalidateOnRefresh: true,
      // markers: true, // Uncomment for debugging
      onEnter: () => {
        console.log("Work section entered - pin activated");
      },
      onLeave: () => {
        console.log("Work section left - pin released");
      },
      onEnterBack: () => console.log("Work section re-entered"),
      onLeaveBack: () => console.log("Work section left backwards"),
      onUpdate: self => {
        // Only log every 0.1 progress for debugging
        if (Math.round(self.progress * 10) % 1 === 0) {
          console.log(`Work Scroll Progress: ${(self.progress * 100).toFixed(1)}%`);
        }
      }
    });

    // Handle image loading with timeout
    const imagePromises = Array.from(track.querySelectorAll('img'))
      .filter(img => !img.complete)
      .map(img => new Promise(resolve => {
        const handler = () => {
          console.log(`Image loaded: ${img.src}`);
          resolve();
        };
        img.addEventListener('load', handler, { once: true });
        img.addEventListener('error', handler, { once: true });
        
        // 🔧 CORREÇÃO: Timeout para imagens que não carregam
        setTimeout(() => {
          console.log(`Image timeout: ${img.src}`);
          resolve();
        }, 5000);
      }));

    Promise.all(imagePromises).then(() => {
      console.log('All images loaded or timed out, refreshing ScrollTrigger');
      st.refresh();
    });

    // Handle window resize
    const resizeHandler = debounce(() => {
      const newDistance = getDistance();
      console.log('Window resized, new distance:', newDistance);
      if (newDistance > 0) {
        st.refresh();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeHandler);
      st.kill();
    };
  });

  mm.add("(max-width: 1023px)", () => {
    // Mobile cleanup
    gsap.set([work, track], { 
      clearProps: "all",
      overflow: "visible" 
    });
    
    ScrollTrigger.getAll()
      .filter(st => st.vars.trigger === work)
      .forEach(st => st.kill());
  });
}

function setupOtherSections() {
  // Setup para outras seções (Statement, Clients, Contact)
  const sections = ['#statement', '#clients', '#contact'];
  
  sections.forEach(selector => {
    const section = document.querySelector(selector);
    if (!section) return;
    
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        console.log(`${selector} section ready`);
      }
    });
  });
}

// -----------------------------
// 6) Utilitários
// -----------------------------
function refreshScrollTriggers() {
  console.log('Refreshing ScrollTriggers...');
  ScrollTrigger.refresh(true);
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
  isHeroAnimationComplete = false;
  whatWeDoReady = false;
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
  
  // Setup mais robusto da altura
  const setWrapperHeight = () => {
    const viewport = window.innerHeight;
    wrapper.style.height = `${viewport}px`;
    console.log('Wrapper height set to:', viewport);
  };
  
  setWrapperHeight();
  
  // Aguarda um frame para garantir que o DOM esteja estável
  requestAnimationFrame(() => {
    // Inicia animação de entrada do Hero
    animateHeroEntry();
    
    // Setup outras seções após um pequeno delay
    gsap.delayedCall(0.3, () => {
      setupWhatWeDoSection();
      setupWorkSectionHorizontal();
      setupOtherSections();
      
      // Refresh escalonado mais conservador
      gsap.delayedCall(0.5, () => {
        ScrollTrigger.refresh();
        console.log('Initial ScrollTriggers refreshed');
      });
      
      gsap.delayedCall(1.5, () => {
        ScrollTrigger.refresh();
        console.log('Final ScrollTriggers refreshed');
      });
    });
  });
  
  // Listener para resize mais robusto
  const handleResize = debounce(() => {
    console.log('Handling resize...');
    setWrapperHeight();
    gsap.delayedCall(0.2, refreshScrollTriggers);
  }, 300);
  
  window.addEventListener('resize', handleResize);
  
  // Cleanup no unload
  window.addEventListener('beforeunload', () => {
    ScrollTrigger.getAll().forEach(st => st.kill());
  });
});

// -----------------------------
// 8) Debug
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  console.log('🛠️ Debug mode ativo');
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    isComplete: () => isHeroAnimationComplete,
    whatWeDoReady: () => whatWeDoReady,
    refresh: refreshScrollTriggers,
    reset: resetAnimations,
    triggers: () => ScrollTrigger.getAll(),
    killAll: () => ScrollTrigger.getAll().forEach(st => st.kill())
  };
}

// Export
export { refreshScrollTriggers, resetAnimations };