import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Splitting from 'splitting';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Executa o Splitting (se já não foi executado na animação de entrada, isso não prejudica)
  Splitting();

  // Seleciona todos os <h2> dentro do container hero-content
  const headings = document.querySelectorAll('.hero-content h2');

  // Cria a timeline para a animação de saída, com um scrollTrigger ajustado para uma duração maior
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=200%", // Aumenta a distância de scroll para que a animação de saída tenha espaço para rodar
      scrub: true,
      markers: true // Apenas para debug; remova ou comente quando estiver satisfeito
    }
  });

  // Para cada heading, anima seus caracteres revertendo o efeito de entrada
  headings.forEach((heading, index) => {
    // Seleciona os caracteres gerados pelo Splitting.js
    const chars = heading.querySelectorAll('.char');

    // Define a perspectiva 3D para o contêiner dos caracteres
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));

    // Adiciona à timeline a animação que reverte o estado dos caracteres
    exitTl.to(
      chars,
      {
        opacity: 0,
        rotationX: -90,
        z: -200,
        ease: 'power1.out',
        stagger: 0.05,
        duration: 1
      },
      index * 0.2 // Mantém o delay incremental entre headings
    );
  });
});
