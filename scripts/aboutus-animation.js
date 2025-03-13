import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Splitting.js para dividir o texto
  Splitting();

  // Seleciona o elemento de texto na seção AboutUs
  const textBack = document.querySelector('#about-us .text-back');
  
  if (textBack) {
    const chars = textBack.querySelectorAll('.char');

    gsap.fromTo(
      chars,
      {
        'will-change': 'transform',
        transformOrigin: '50% 100%',
        scaleY: 0,
      },
      {
        ease: 'power3.in',
        opacity: 1,
        scaleY: 1,
        stagger: 0.05,
        scrollTrigger: {
          // Utiliza a própria seção AboutUs como gatilho
          trigger: "#about-us",
          // Inicia a animação quando a seção atingir o topo da viewport
          start: "top top",
          // Aumente o valor do end para garantir que toda a animação seja executada
          end: "+=400%",
          scrub: true,
          // Fixa a seção AboutUs na viewport durante a animação
          pin: true,
          pinSpacing: true, // Remove o espaçamento adicional criado pelo pin, se desejado
        },
      }
    );
  }
});
