// hero-transition.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const clipRects = document.querySelectorAll('#heroClip rect');
  
  // Garante o estado inicial: cada retângulo com y="0" e height="1"
  clipRects.forEach(rect => {
    rect.setAttribute('y', 0);
    rect.setAttribute('height', 1);
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
      pin: true,
      pinSpacing: false,
      // markers: true, // para depuração
    }
  });

  // Anima os retângulos: de y:0, height:1  →  y:0.5, height:0
  tl.to(clipRects, {
    attr: { y: 0.5, height: 0 },
    ease: "power2.inOut",
    stagger: 0.08,
    duration: 1
  });
});
