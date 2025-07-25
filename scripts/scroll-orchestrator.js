/* global Splitting */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// 1) Split text e animação de entrada do Hero
document.addEventListener('DOMContentLoaded', () => {
  Splitting(); 
  gsap.from('.hero-content .char', {
    opacity: 0,
    y: 50,
    rotationX: -90,
    transformOrigin: '50% 0%',
    ease: 'power2.out',
    duration: 0.8,
    stagger: 0.02
  });
  initScrollOrchestration();
});

// 2) Refresh ao carregar tudo
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

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
  const aboutChars = document.querySelectorAll('#about-us .char');

  if (!heroChars.length || !clipRects.length || !aboutChars.length) return;

  // timeline pinada ao #hero, dura 200% da viewport (ajuste se precisar)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: () => `+=${window.innerHeight * 2}`, 
      scrub: true,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      markers: false // true para debug visual
    }
  });

  // 1) hero-text-exit-animation
  tl.addLabel('exit', 0)
    .to(heroChars, {
      opacity: 0,
      y: -50,
      ease: 'power2.in',
      stagger: 0.02
    }, 'exit');

  // 2) hero-transition (clip-path reveal)
  tl.addLabel('trans', 'exit+=0.5')
    .to(clipRects, {
      attr: { y: 0.5, height: 0 },
      ease: 'power2.inOut',
      stagger: 0.1,
      duration: 0.8
    }, 'trans');

  // 3) about-us-animation
  tl.addLabel('about', 'trans+=0.5')
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
