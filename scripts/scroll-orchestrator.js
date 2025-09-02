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
  
  // Garante que What We Do está oculto inicialmente
  gsap.set(whatWeDo, { autoAlpha: 0 });
  
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
        console.log('Hero/About timeline complete - showing What We Do');
        gsap.set(whatWeDo, { autoAlpha: 1 });
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
  
  // Inicialmente escondido
  gsap.set(section, { autoAlpha: 0 });
  
  // ScrollTrigger para controlar a seção inteira
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin: true,
    pinSpacing: false,
    anticipatePin: 1, // suaviza a troca de pins p/ a próxima seção (Work)
    onEnter: () => {
      console.log('What We Do section entering viewport');
      
      // Fade in da seção
      gsap.to(section, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.out'
      });
      
      // Animação das rows
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
            distance,
            viewport: window.innerHeight
        });
        
        return distance;
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

        // Create the horizontal animation
        const horizontalAnimation = gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            paused: true
        });

        // Create ScrollTrigger with the animation
        const st = ScrollTrigger.create({
            trigger: work,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            anticipatePin: 1,
            scrub: true,
            animation: horizontalAnimation,
            invalidateOnRefresh: true,
            // markers: true, // Uncomment for debugging
            onEnter: () => {
                console.log("Work section entered - pin activated");
                gsap.to(work, { 
                    duration: 0.3,
                    opacity: 1,
                    ease: "power2.out" 
                });
            },
            onLeave: () => console.log("Work section left - pin released"),
            onEnterBack: () => console.log("Work section re-entered"),
            onLeaveBack: () => console.log("Work section left backwards"),
            onUpdate: self => {
                // Only log every 0.1 progress for debugging
                if (Math.round(self.progress * 10) % 1 === 0) {
                    console.log(`Scroll Progress: ${(self.progress * 100).toFixed(1)}%`);
                }
            }
        });

        // Handle image loading
        Promise.all(
            Array.from(track.querySelectorAll('img'))
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    const handler = () => {
                        console.log(`Image loaded: ${img.src}`);
                        resolve();
                    };
                    img.addEventListener('load', handler, { once: true });
                    img.addEventListener('error', handler, { once: true });
                }))
        ).then(() => {
            console.log('All images loaded, refreshing ScrollTrigger');
            st.refresh();
        });

        // Handle window resize
        const resizeHandler = debounce(() => {
            const newDistance = getDistance();
            console.log('Window resized, new distance:', newDistance);
            st.refresh();
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
  
  // Inicia animação de entrada do Hero
  animateHeroEntry();
  
  // Setup outras seções (independente do Hero)
  setupWhatWeDoSection();
  setupWorkSectionHorizontal();  // Nova função de scroll horizontal
  setupTestimonialsSection();
  
  // Refresh após fontes/imagens carregarem
  const refresh = () => {
    ScrollTrigger.refresh();
    console.log('ScrollTriggers refreshed');
  };
  
  // Múltiplos pontos de refresh para garantir
  window.addEventListener("load", refresh);
  gsap.delayedCall(0.6, refresh);
  
  // Listener para resize
  const handleResize = debounce(() => {
    console.log('Handling resize...');
    const newViewport = window.innerHeight;
    wrapper.style.height = `${newViewport}px`;
    gsap.delayedCall(0.1, refreshScrollTriggers);
  }, 300);
  
  window.addEventListener('resize', handleResize);
});

// -----------------------------
// 8) Debug
// -----------------------------
if (window.location.hash === '#debug') {
  ScrollTrigger.defaults({ markers: true });
  console.log('🐛 Debug mode ativo');
  
  window.debugScrollOrchestrator = {
    heroChars: () => heroAllChars,
    aboutChars: () => aboutChars,
    isComplete: () => isHeroAnimationComplete,
    refresh: refreshScrollTriggers,
    reset: resetAnimations,
    timeline: () => ScrollTrigger.getAll()
  };
}

// Export
export { refreshScrollTriggers, resetAnimations };