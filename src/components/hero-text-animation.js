// Importa as bibliotecas necessárias
import Splitting from 'splitting';
import gsap from 'gsap';

// Dispara a animação assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Splitting.js para dividir os textos em caracteres
  Splitting();

  // Seleciona todos os <h2> dentro do container hero-content
  const headings = document.querySelectorAll('.hero-content h2');
  
  // Cria uma timeline para encadear as animações dos headings com delays entre eles
  const tl = gsap.timeline({ delay: 0.5 });

  // Itera sobre cada heading para animar seus caracteres
  headings.forEach((heading, index) => {
    // Seleciona todos os caracteres (elementos com a classe .char) gerados pelo Splitting.js
    const chars = heading.querySelectorAll('.char');

    // Define a perspectiva 3D para o elemento pai de cada caractere
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));

    // Adiciona a animação para cada heading à timeline com um delay incremental
    tl.fromTo(
      chars,
      {
        // Estado inicial: os caracteres estão invisíveis, com rotação no eixo X e deslocamento no eixo Z
        opacity: 0,
        rotationX: -90,
        z: -200,
        transformOrigin: '50% 0%'
      },
      {
        // Estado final: os caracteres se tornam visíveis e retornam à posição original
        opacity: 1,
        rotationX: 0,
        z: 0,
        ease: 'power1.out',
        stagger: 0.05, // Cada caractere anima com 0.05s de delay entre si
        duration: 1
      },
      index * 0.2 // Delay incremental entre cada heading (0.2s por índice)
    );
  });
});
