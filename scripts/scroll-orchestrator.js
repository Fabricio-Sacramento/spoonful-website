// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ===========================
// Inicialização ao carregar
// ===========================
window.addEventListener('load', () => {
  setupHero();
  setupAboutUs();
  // Recalibra todos os ScrollTriggers
  ScrollTrigger.refresh();
});

// ===========================
// Configurações da seção Hero
// ===========================
function setupHero() {
  // 1) Split apenas nos <h2> do Hero
  const heroResults = Splitting({ target: '.hero-content h2', by: 'chars' });
  // Cada resultado tem .chars = array de <span class="char">
  const heroCharsByHeading = heroResults.map(r => r.chars);

  // 2) Ajuste de perspectiva para cada char
  heroCharsByHeading.flat().forEach(c =>
    gsap.set(c.parentNode, { perspective: 1000 })
  );

  // 3) Animação de entrada
  heroEntryAnimation(heroCharsByHeading);

  // 4) Pin + scroll‑triggered
  initHeroPin(heroCharsByHeading);
}

function heroEntryAnimation(heroCharsByHeading) {
  const tl = gsap.timeline();
  heroCharsByHeading.forEach((chars, i) => {
    tl.fromTo(
      chars,
      { opacity: 0, rotationX: -90, z: -200, transformOrigin: '50% 0%' },
      {
        opacity: 1,
        rotationX: 0,
        z: 0,
        ease: 'power1.out',
        stagger: 0.05,
        duration: 0.5
      },
      i * 0.1
    );
  });
}

function initHeroPin(heroCharsByHeading) {
  const allChars = heroCharsByHeading.flat();
  const clipRects = gsap.utils.toArray('clipPath#heroClip rect');

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true,
      pinSpacing: false
    }
  })
    // anima os chars “saindo”
    .to(allChars, {
      opacity: 0,
      rotationX: 90,
      z: -200,
      transformOrigin: '50% 100%',
      ease: 'power1.in',
      stagger: 0.02,
      duration: 0.3
    }, 0)
    // anima o clipPath (se existir)
    .to(clipRects, {
      attr: { y: 0.5, height: 0 },
      ease: 'power2.inOut',
      stagger: 0.05,
      duration: 0.8
    }, 0);
}

// ================================
// Configurações da seção About Us
// ================================
function setupAboutUs() {
  // 1) Split apenas no .text-back
  const aboutResults = Splitting({ target: '#about-us .text-back', by: 'chars' });
  const aboutChars = aboutResults.flatMap(r => r.chars);

  // 2) Perspectiva em cada char
  aboutChars.forEach(c =>
    gsap.set(c.parentNode, { perspective: 1000 })
  );

  // 3) Pin + animação com scrub
  initAboutUsPin(aboutChars);
}

function initAboutUsPin(aboutChars) {
  gsap.timeline({
    scrollTrigger: {
      trigger: '#about-us',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true,
      pinSpacing: true
    }
  })
    .fromTo(
      aboutChars,
      { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
      { scaleY: 1, opacity: 1, ease: 'power3.in', stagger: 0.03, duration: 0.5 }
    );
}
