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

  // Seleciona a seção "What We Do" para calcular seu centro
  const section = document.querySelector(".what-we-do");
  const sectionRect = section.getBoundingClientRect();
  const sectionCenterX = sectionRect.left + sectionRect.width / 2;
  const sectionCenterY = sectionRect.top + sectionRect.height / 2;

  // Calcula o centro atual de c3
  const c3Rect = c3.getBoundingClientRect();
  const naturalCenterX = c3Rect.left + c3Rect.width / 2;
  const naturalCenterY = c3Rect.top + c3Rect.height / 2;
  // Define os deslocamentos para centralizar c3 na seção
  const dx = sectionCenterX - naturalCenterX;
  const dy = sectionCenterY - naturalCenterY;

  // Cria a timeline para as animações
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // --- Animação da Coluna C3 ---
  // Estado inicial: posiciona c3 com deslocamento calculado e fora da seção (abaixo)
  tl.set(c3, { transformOrigin: "50% 50%", x: dx, y: sectionRect.height, scale: 0.75 });
  tl.to(c3, { x: dx, y: dy, duration: 1.2 });
  tl.to(c3, { duration: 0.3 }); // pequena pausa
  // Retorna c3 à sua posição natural na seção e escala para 1
  tl.to(c3, { x: 0, y: 0, scale: 1, duration: 1 });

  // --- Animação da Coluna C2 ---
  tl.from(c2, { opacity: 0, scale: 0.5, duration: 1 }, "-=0.5");
  tl.to(c2, { opacity: 1, scale: 1, duration: 1 }, "-=0.5");
  tl.fromTo(c2Frames, { rotationX: 0 }, { rotationX: 360, duration: 1 }, "<");

  // --- Animação da Coluna C1 (Texto) ---
  // Garante que os spans tenham o atributo para o Splitting
  c1Spans.forEach(span => {
    if (!span.hasAttribute("data-splitting")) {
      span.setAttribute("data-splitting", "chars");
    }
  });
  // Processa os spans para dividir em caracteres
  Splitting({ target: ".c1__words li span" });
  tl.to({}, { duration: 0.1 });
  tl.add(() => {
    const chars = document.querySelectorAll(".c1__words li .char");
    if (chars.length) {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          rotationX: -90,
          z: -200,
          transformOrigin: "0% 50%"
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
document.addEventListener("DOMContentLoaded", () => {
    ScrollTrigger.create({
      trigger: ".trigger-end-about",
      start: "top center",
      once: true,
      onEnter: startWhatWeDoAnimation,
      markers: true
    });
  });
