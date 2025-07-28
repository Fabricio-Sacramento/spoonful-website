// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
  setupHero();
  setupAboutUs();
  ScrollTrigger.refresh();
});

// ===========================
// Seção Hero
// ===========================
function setupHero() {
  // 1) Split só nos <h2> do Hero
  const heroResults       = Splitting({ target: '.hero-content h2', by: 'chars' });
  const heroCharsByHeading = heroResults.map(r => r.chars);
  const allChars           = heroCharsByHeading.flat();
  const clipRects          = gsap.utils.toArray('clipPath#heroClip rect');

  // 2) Perspectiva e backface no container e no próprio char
  allChars.forEach(c => {
    gsap.set(c.parentNode, { perspective: 1000 });
    gsap.set(c, { transformStyle: 'preserve-3d', backfaceVisibility: 'visible' });
  });

  // 3) Animação de entrada (fade + flip de cima pra baixo)
  heroEntryAnimation(heroCharsByHeading);

  // 4) Pin + animação de saída (flip de baixo pra cima) com delay
  initHeroPin(heroCharsByHeading, clipRects);
}

function heroEntryAnimation(charsByHeading) {
  const tl = gsap.timeline();
  charsByHeading.forEach((chars, i) => {
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

function initHeroPin(charsByHeading, clipRects) {
  const allChars = charsByHeading.flat();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      pin: true,
      pinSpacing: false
    }
  });

  // ——— Delay de 20% do scroll antes de qualquer saída ———
  tl.to({}, { duration: 0.2 });

  // ——— Flip de saída após o delay ———
  tl.to(
    allChars,
    {
      opacity: 0,
      rotationX: 90,
      z: -200,
      transformOrigin: '50% 100%',
      ease: 'power1.in',
      stagger: 0.02,
      duration: 0.3
    },
    0.2
  );

  // ——— ClipPath reduzido alinhado ao mesmo delay ———
  tl.to(
    clipRects,
    {
      attr: { y: 0.5, height: 0 },
      ease: 'power2.inOut',
      stagger: 0.05,
      duration: 0.8
    },
    0.2
  );
}

// ================================
// Seção About Us (sem alterações)
// ================================
function setupAboutUs() {
  const aboutResults = Splitting({ target: '#about-us .text-back', by: 'chars' });
  const aboutChars   = aboutResults.flatMap(r => r.chars);

  aboutChars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));

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
    .to({}, { duration: 0.2 }) // same small delay
    .fromTo(
      aboutChars,
      { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
      {
        scaleY: 1,
        opacity: 1,
        ease: 'power3.in',
        stagger: 0.03,
        duration: 0.5
      }
    );
}
