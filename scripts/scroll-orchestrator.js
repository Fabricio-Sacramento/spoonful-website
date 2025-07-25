/* global Splitting */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 1) Fragmenta texto e animação de entrada do Hero
document.addEventListener('DOMContentLoaded', () => {
  Splitting(); 
  initHeroEntry();
  initScrollOrchestration();
});

// 2) Após tudo carregar, refresh nos ScrollTriggers
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

function initHeroEntry() {
  const headings = document.querySelectorAll('.hero-content h2');
  if (!headings.length) return;

  const heroEntryTl = gsap.timeline({ delay: 1 });
  headings.forEach((h, i) => {
    const chars = h.querySelectorAll('.char');
    heroEntryTl.fromTo(
      chars,
      { opacity: 0, rotationX: -90, z: -200, transformOrigin: '50% 0%' },
      { opacity: 1, rotationX: 0, z: 0, ease: 'power2.out', duration: 0.5, stagger: 0.05 },
      i * 0.05
    );
  });
  return heroEntryTl;
}

function initScrollOrchestration() {
  ScrollTrigger.matchMedia({
    '(min-width: 768px)': () => initHeroScrollTimeline(),
    '(max-width: 767px)': () => {
      // animação simplificada no mobile
      gsap.from('.hero-content', { opacity: 1, duration: 0.5 });
    }
  });
}

function initHeroScrollTimeline() {
  const heroChars = document.querySelectorAll('.hero-content .char');
  const clipRects  = document.querySelectorAll('#heroClip rect');
  const aboutChars = document.querySelectorAll('#about-us .text-back .char');
  if (!heroChars.length || !clipRects.length || !aboutChars.length) return;

  // timeline pinada no #hero
  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: () => `+=${window.innerHeight * 2}`, // 200% da altura da viewport
      scrub: true,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1
    }
  })
  // 1) hero-text-exit-animation
  .addLabel('exit', 0)
  .to(heroChars, {
    opacity: 0,
    y: -50,
    ease: 'power2.in',
    stagger: 0.02,
    duration: 0.5
  }, 'exit')

  // 2) hero-transition (clip-path)
  .addLabel('trans', 'exit+=0.5')
  .to(clipRects, {
    attr: { y: 0.5, height: 0 },
    ease: 'power2.inOut',
    stagger: 0.1,
    duration: 0.8
  }, 'trans')

  // 3) about-us-animation (entrada do texto)
  .addLabel('about', 'trans+=0.5')
  .fromTo(aboutChars,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      stagger: 0.03,
      duration: 0.6
    },
    'about'
  );
}
