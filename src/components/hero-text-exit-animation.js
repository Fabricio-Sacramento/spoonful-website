import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Splitting from 'splitting';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Se o Splitting já foi executado na animação de entrada, essa chamada não prejudica,
  // mas se preferir, pode omitir ou garantir que seja executado apenas uma vez.
  Splitting();

  // Seleciona todos os <h2> dentro do container hero-content
  const headings = document.querySelectorAll('.hero-content h2');

  // Cria uma timeline que será controlada pelo scroll para reverter a animação
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",    // Ajuste conforme necessário para o início do scroll
      end: "bottom top",   // Ajuste para determinar a duração do efeito no scroll
      scrub: true          // Faz a animação acompanhar o scroll
    }
  });

  // Para cada heading, anima seus caracteres revertendo a transformação
  headings.forEach((heading, index) => {
    // Seleciona os caracteres criados pelo Splitting.js
    const chars = heading.querySelectorAll('.char');

    // Define a perspectiva, se necessário (mesma usada na animação de entrada)
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));

    // Adiciona à timeline uma animação para cada heading
    exitTl.to(
      chars,
      {
        // Reverte para o estado inicial: invisível, com rotaçãoX: -90 e deslocamento em z
        opacity: 0,
        rotationX: -90,
        z: -200,
        ease: 'power1.out',
        stagger: 0.05,
        duration: 1
      },
      index * 0.2  // Mantém o delay incremental entre headings
    );
  });
});
