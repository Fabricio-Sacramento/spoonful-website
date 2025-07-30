// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ————— Ajuste aqui o delay antes da saída do Hero —————
const HERO_EXIT_DELAY = 0.3; // em segundos

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
    gsap.set(char.parentNode, { perspective: 1000 });
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
// 2) Animação de entrada do Hero ao carregar a página
// -----------------------------
function animateHeroEntry() {
  gsap.set(heroAllChars, {
    opacity: 0,
    rotationX: -90,
    z: -200,
    transformOrigin: '50% 0%'
  });

  heroCharsByLine.forEach((chars, i) => {
    gsap.to(chars, {
      opacity: 1,
      rotationX: 0,
      z: 0,
      ease: 'power1.out',
      stagger: 0.05,
      duration: 0.5,
      delay: 0.5 + i * 0.1
    });
  });
}

// -----------------------------
// 3) Timeline unificada para Hero + About Us atrelada ao scroll
// -----------------------------
function initHeroAboutTimeline() {
  const wrapper = document.querySelector('.intro-wrapper');

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      onLeave: () => {
        gsap.set(wrapper, { autoAlpha: 0, display: 'none' });
      },
      onEnterBack: () => {
        gsap.set(wrapper, { autoAlpha: 1, display: 'block' });
      }
    }
  });

  // Delay antes de disparar o heroExit
  masterTl.to({}, { duration: HERO_EXIT_DELAY });
  masterTl.addLabel('heroExit');

  // 3.1) Saída do Hero
  masterTl.to(
    heroAllChars,
    {
      opacity: 0,
      rotationX: 90,
      z: -200,
      transformOrigin: '50% 100%',
      ease: 'power1.in',
      stagger: 0.02,
      duration: 0.3
    },
    'heroExit'
  );

  // 3.2) Clip‑path do Hero
  masterTl.to(
    clipRects,
    {
      attr: { y: 0.5, height: 0 },
      ease: 'power2.inOut',
      stagger: 0.05,
      duration: 0.8
    },
    'heroExit+=0.1'
  );

  // 3.3) Entrada do About Us
  masterTl.fromTo(
    aboutChars,
    { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
    {
      scaleY: 1,
      opacity: 1,
      ease: 'power3.in',
      stagger: 0.03,
      duration: 0.5
    },
    'heroExit+=0.2'
  );
}

// -----------------------------
// 4) Inicialização dos eventos
// -----------------------------
// 4.1) DOMContentLoaded: Splitting + entrada do Hero
document.addEventListener('DOMContentLoaded', () => {
  prepareSplitting();
  animateHeroEntry();
});

// 4.2) Load completo: ajusta altura do wrapper e dispara timelines
window.addEventListener('load', () => {
  const wrapper = document.querySelector('.intro-wrapper');
  const viewport = window.innerHeight;

  // Buffer extra para manter o pin ativo enquanto dura a animação do About Us
  const extraDelay = viewport * 0.8;
  wrapper.style.height = `${viewport * 2 + extraDelay}px`;

  initHeroAboutTimeline();
  setupWorkSection();
  setupWhatWeDoSection();
  setupTestimonialsSection();

  ScrollTrigger.refresh();
});

// =====================
// Stubs das outras seções
// =====================
function setupWorkSection() {}
function setupWhatWeDoSection() {}
function setupTestimonialsSection() {}
