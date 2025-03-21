import { gsap } from "gsap";
import Splitting from "splitting";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function startWhatWeDoAnimation() {
  // Seleciona os elementos das colunas
  const c3 = document.querySelector(".what-we-do .c3");
  const c2 = document.querySelector(".what-we-do .c2");
  const c2Frames = document.querySelector(".c2__frames");
  const c1Spans = document.querySelectorAll(".c1__words li span");

  // Cria uma timeline para as animações
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // --- Animação da Coluna C3 ---
  // Anima de uma posição levemente abaixo com menor escala até sua posição natural
  tl.from(c3, { opacity: 0, y: 100, scale: 0.75, duration: 1 });
  tl.to(c3, { opacity: 1, y: 0, scale: 1, duration: 1 }, "-=0.5");

  // --- Animação da Coluna C2 ---
  // Animação de opacidade e escala
  tl.from(c2, { opacity: 0, scale: 0.5, duration: 1 }, "-=0.5");
  tl.to(c2, { opacity: 1, scale: 1, duration: 1 }, "-=0.5");
  // Animação de rotação do container dos frames
  tl.fromTo(c2Frames, { rotationX: 0 }, { rotationX: 360, duration: 1 }, "<");

  // --- Animação da Coluna C1 (Texto) ---
  // Garante que os spans possuam o atributo para o Splitting
  c1Spans.forEach(span => {
    if (!span.hasAttribute("data-splitting")) {
      span.setAttribute("data-splitting", "chars");
    }
  });
  // Processa os spans para dividir em caracteres
  Splitting({ target: ".c1__words li span" });
  tl.to({}, { duration: 0.1 });
  // Anima os caracteres (classe .char)
  tl.add(() => {
    const chars = document.querySelectorAll(".c1__words li .char");
    if (chars.length) {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          rotationX: -90,
          z: -200,
          transformOrigin: "50% 0%"
        },
        {
          opacity: 1,
          rotationX: 0,
          z: 0,
          duration: 0.5,
          ease: "power1.out",
          stagger: 0.05
        }
      );
    }
  });
}

// Dispara a animação quando a div .spacer entrar na viewport,
// indicando que About Us já liberou o espaço e permitindo que o HTML posicione "What We Do" naturalmente.
ScrollTrigger.create({
  trigger: ".spacer",
  start: "top bottom", // quando o topo do spacer atinge o fundo da viewport
  onEnter: startWhatWeDoAnimation,
  once: true
});
