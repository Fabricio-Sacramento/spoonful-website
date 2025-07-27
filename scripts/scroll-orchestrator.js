// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

// 1) Fragmenta apenas os headings do Hero quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  // Limita o Splitting aos H2 dentro de .hero-content
  gsap.utils.toArray('.hero-content h2').forEach((el) => {
    Splitting({ target: el });
  });
});

// 2) Após o load completo, dispara entrada do Hero e inicializa pins
window.addEventListener('load', () => {
  heroEntryAnimation();
  requestAnimationFrame(() => {
    initHeroPin();
    initAboutUsPin();
    ScrollTrigger.refresh();
  });
});

/**
 * Animação de entrada do texto do Hero (flip-in por caractere)
 */
function heroEntryAnimation() {
  // obtém array de <h2>
  const headings = gsap.utils.toArray('.hero-content h2');
  const entryTl = gsap.timeline();

  headings.forEach((heading, i) => {
    // array de caracteres dentro de cada heading
    const chars = gsap.utils.toArray(heading.querySelectorAll('.char'));
    if (!chars.length) return; // pula se não houver chars

    // define perspectiva para cada caractere
    chars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));

    // anima cada caractere
    entryTl.fromTo(
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
      i * 0.05
    );
  });
}

/**
 * Cria pinning apenas para a seção Hero enquanto a animação roda
 */
function initHeroPin() {
  const clipRects = gsap.utils.toArray('#heroClip rect');

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1
    }
  })
    // 1) Exit do Hero Text
    .to(
      gsap.utils.toArray('.hero-content .char'),
      {
        opacity: 0,
        rotationX: -90,
        z: -200,
        transformOrigin: '100% 100%',
        ease: 'power1.out',
        stagger: { each: 0.05, from: 'end' },
        duration: 1
      },
      0
    )
    // 2) Hero clip‐path
    .to(
      clipRects,
      {
        attr: { y: 0.5, height: 0 },
        ease: 'power2.inOut',
        stagger: 0.09,
        duration: 1
      },
      0
    )
    // 3) Pequeno delay antes do próximo pin
    .to({}, { duration: 0.5 });
}

/**
 * Cria pinning para a seção About Us durante sua animação de entrada
 */
function initAboutUsPin() {
  const aboutChars = gsap.utils.toArray('#about-us .text-back .char');
  if (!aboutChars.length) return;

  aboutChars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));

  gsap.timeline({
    scrollTrigger: {
      trigger: '#about-us',
      start: 'top top',
      end: '+=1000',
      scrub: false,
      pin: true,
      pinSpacing: false,
      markers: true,
      anticipatePin: 1
    }
  })
    // Entrada do texto de fundo do About Us
    .fromTo(
      aboutChars,
      { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
      { scaleY: 1, opacity: 1, ease: 'power3.in', stagger: 0.05 }
    );
}
