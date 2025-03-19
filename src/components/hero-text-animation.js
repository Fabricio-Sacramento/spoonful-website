import Splitting from 'splitting';
import gsap from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Splitting.js para dividir os textos em caracteres
  Splitting();

  // Seleciona todos os <h2> dentro do container hero-content
  const headings = document.querySelectorAll('.hero-content h2');
  
  // Cria a timeline para a animação de entrada com delay de 1 segundo
  const tl = gsap.timeline({ delay: 1 });
  let entryComplete = false; // Flag para indicar que a animação de entrada foi concluída

  headings.forEach((heading, index) => {
    // Seleciona os caracteres gerados pelo Splitting.js
    const chars = heading.querySelectorAll('.char');
    
    // Define a perspectiva 3D para o contêiner de cada caractere
    chars.forEach(char => gsap.set(char.parentNode, { perspective: 1000 }));
    
    // Adiciona à timeline a animação de entrada para cada heading com delay incremental
    tl.fromTo(
      chars,
      {
        opacity: 0,
        rotationX: -90,
        z: -200,
        transformOrigin: '50% 0%'
      },
      {
        opacity: 1,
        rotationX: 0,
        z: 0,
        ease: 'power1.out',
        stagger: 0.05,
        duration: 1
      },
      index * 0.2
    );
  });

  // Ao concluir a animação de entrada, pausa a timeline e ativa a flag
  tl.eventCallback("onComplete", () => {
    tl.pause();
    entryComplete = true;
  });

  // Listener de scroll para atualizar o progresso da timeline somente após a entrada
  window.addEventListener('scroll', () => {
    if (!entryComplete) return; // Se a animação de entrada não terminou, não atualiza
    const scrollTop = window.scrollY;
    const heroHeight = window.innerHeight; // Usamos a altura da viewport como referência
    const progress = Math.min(scrollTop / heroHeight, 1);
    // Atualiza o progresso de forma invertida:
    // No topo (scroll = 0): progress = 0 → tl.progress(1) (estado final, texto visível)
    // Ao rolar uma viewport inteira (scroll = heroHeight): progress = 1 → tl.progress(0) (estado inicial)
    tl.progress(1 - progress);
  });
});
