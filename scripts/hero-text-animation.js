// src/scripts/hero-text-animation.js
import Splitting from 'splitting';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Hero Text Animation: entrada e saída sincronizadas com scroll
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa Splitting.js para fragmentar o texto em caracteres
  Splitting();

  // Seleciona todos os <h2> na Hero
  const headings = document.querySelectorAll('.hero-content h2');
  let entryComplete = false;

  // Timeline de entrada dos caracteres
  const entryTl = gsap.timeline({ delay: 1 });
  headings.forEach((heading, idx) => {
    const chars = heading.querySelectorAll('.char');
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));
    entryTl.fromTo(
      chars,
      { opacity: 0, rotationX: -90, z: -200, transformOrigin: '50% 0%' },
      { opacity: 1, rotationX: 0, z: 0, ease: 'power1.out', stagger: 0.05, duration: 0.5 },
      idx * 0.05
    );
  });

  entryTl.eventCallback('onComplete', () => {
    entryComplete = true;
    window.dispatchEvent(new CustomEvent('heroEntryComplete'));
  });

  // Timeline de saída via ScrollTrigger
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=150%',
      scrub: true,
      // markers: true, // descomente para debug
    }
  });

  headings.forEach((heading, idx) => {
    const chars = heading.querySelectorAll('.char');
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));
    exitTl.to(
      chars,
      { opacity: 0, rotationX: -90, z: -200, ease: 'power1.out', stagger: 0.05, duration: 1 },
      idx * 0.2
    );
  });

  // Opcional: controlar saída inversa manualmente após entrada (fallback)
  window.addEventListener('scroll', () => {
    if (!entryComplete) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const startOffset = vh * 0.1;
    const raw = Math.max(0, scrollY - startOffset);
    const prog = Math.min(raw / (vh - startOffset), 1);
    entryTl.progress(1 - prog);
  });
});