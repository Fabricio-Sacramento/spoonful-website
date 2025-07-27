// src/scroll-orchestrator.js

import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// (Opcional) expõe para o console em desenvolvimento
window.ScrollTrigger = ScrollTrigger;

/**
 * 1) Fragmenta textos assim que o DOM estiver pronto:
 *    - Splitting() padrão para elementos com `data-splitting` (ex.: About Us)
 *    - Splitting específico para os H2 do Hero
 */
window.addEventListener('DOMContentLoaded', () => {
  Splitting(); // fragmenta qualquer elemento marcado
  gsap.utils.toArray('.hero-content h2').forEach(el => {
    Splitting({ target: el });
  });
});

/**
 * 2) Ao carregar totalmente a janela, dispara entrada do Hero
 *    e inicializa os pins
 */
window.addEventListener('load', () => {
  heroEntryAnimation();
  requestAnimationFrame(() => {
    initHeroPin();
    initAboutUsPin();
    ScrollTrigger.refresh();
  });
});

/**
 * Flip-in por caractere do texto do Hero
 */
function heroEntryAnimation() {
  const headings = gsap.utils.toArray('.hero-content h2');
  const entryTl = gsap.timeline();

  headings.forEach((heading, i) => {
    const chars = gsap.utils.toArray(heading.querySelectorAll('.char'));
    if (!chars.length) return;

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
 * Pin e animação de saída do Hero
 */
function initHeroPin() {
  const chars     = gsap.utils.toArray('.hero-content .char');
  const clipRects = gsap.utils.toArray('#heroClip rect');

  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   0.5,
      pin:     true,
      pinSpacing: false,
      anticipatePin: 1,
      // ⬇️ Quando rolar acima de 'start', reseta o estado dos chars
      onLeaveBack() {
        gsap.set(chars, {
          opacity: 1,
          rotationX:  0,
          z:          0
        });
      }
    }
  })
  // 1) Fade-out+flip do texto do Hero
  .to(chars, {
    opacity: 0,
    rotationX: -90,
    z:        -200,
    transformOrigin: '100% 100%',
    ease:     'power1.out',
    stagger:  { each: 0.05, from: 'end' },
    duration: 1
  }, 0)
  // 2) Clip‐path do Hero
  .to(clipRects, {
    attr:    { y: 0.5, height: 0 },
    ease:    'power2.inOut',
    stagger: 0.09,
    duration: 1
  }, 0)
  // 3) Pequeno delay antes de soltar o pin
  .to({}, { duration: 0.5 });
}



/**
 * Pin da seção About Us, soltando quando #what-we-do chegar ao topo
 */
function initAboutUsPin() {
  const aboutChars = gsap.utils.toArray('#about-us .char');
  if (!aboutChars.length) return;

  aboutChars.forEach(c => gsap.set(c.parentNode, { perspective: 1000 }));

  ScrollTrigger.create({
    trigger: '#about-us',
    start: 'top top',
    endTrigger: '#what-we-do',
    end: 'top top',
    pin: true,
    pinSpacing: true,
    anticipatePin: 1
    // markers: true
  });

  // animação do texto de fundo do About Us
  gsap.fromTo(
    aboutChars,
    { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
    { scaleY: 1, opacity: 1, ease: 'power3.in', stagger: 0.05 }
  );
}
