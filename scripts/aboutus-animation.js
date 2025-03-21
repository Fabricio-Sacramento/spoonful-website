import Splitting from 'splitting';
import 'splitting/dist/splitting.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Splitting.js para dividir o texto
  Splitting();

  // Define a variável de delay (em segundos)
  const delayAnimation = 1; // ajuste conforme necessário

  // Seleciona o elemento de texto na seção AboutUs
  const textBack = document.querySelector('#about-us .text-back');
  
  if (textBack) {
    const chars = textBack.querySelectorAll('.char');
    
    // Cria uma timeline com o ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about-us",
        start: "top top",
        end: "+=400%",
        scrub: true,
        pin: true,
        pinSpacing: true,
      }
    });

    // Insere um tween vazio para simular o delay
    tl.to({}, { duration: delayAnimation });

    // Adiciona a animação dos caracteres
    tl.fromTo(
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
      }
    );
  }
});
