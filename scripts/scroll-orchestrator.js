// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Fragmenta todos os textos em caracteres quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
  Splitting();
});

// Depois do load, dispara a entrada do Hero e inicializa a animação de scroll
window.addEventListener('load', () => {
  setTimeout(heroEntryAnimation, 200);
  setTimeout(initScrollAnimation, 200);
});

/**
 * Entrada do texto do Hero: letters flip-in.
 */
function heroEntryAnimation() {
  const headings = document.querySelectorAll('.hero-content h2');

  const entryTl = gsap.timeline();
  headings.forEach((heading, i) => {
    const chars = heading.querySelectorAll('.char');
    chars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));
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
 * Timeline atrelada ao scroll:
 * 1) Exit do Hero Text vindo do canto inferior direito
 * 2) Hero Transition (clip‐path) da esquerda para a direita
 * 3) Entrada do texto de background do About Us
 */
function initScrollAnimation() {
  const heroChars = document.querySelectorAll('.hero-content .char');
  const clipRects = document.querySelectorAll('#heroClip rect');
  const aboutChars = document.querySelectorAll('#about-us .text-back .char');

  heroChars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));
  aboutChars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));

  gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: () => `+=${window.innerHeight * 1.5}`,
      scrub: 0.5,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1
    }
  })
    // 1) Exit do Hero Text, flap + fade, pivot no bottom-right
    .to(
      heroChars,
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

    // 2) Hero Transition: tiras abrem da esquerda → direita (stagger padrão)
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

    // 3) Pequeno delay
    .to({}, { duration: 1 }, 0)

    // 4) Entrada do texto de background do About Us
    .fromTo(
      aboutChars,
      { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
      { scaleY: 1, opacity: 1, ease: 'power3.in', stagger: 0.05 },
      0
    );
}