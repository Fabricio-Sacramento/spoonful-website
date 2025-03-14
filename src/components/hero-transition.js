// hero-transition.js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.transition-overlay');
  if (!overlay) return;
  
  // Seleciona todas as stripes dentro do overlay (agora serão 5)
  const stripes = overlay.querySelectorAll('.stripe');
  
  // Cria uma timeline com ScrollTrigger para a seção #hero
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top", // Ajuste conforme o efeito desejado
      scrub: true,
      pin: true,
      // markers: true, // Descomente para depuração
    }
  });
  
  // Anima cada stripe: de scaleY 1 (visível) para 0 (colapsada)
  tl.to(stripes, {
    scaleY: 0,
    ease: "power2.inOut",
    stagger: 0.1, // Efeito escalonado entre as stripes
  });
});
