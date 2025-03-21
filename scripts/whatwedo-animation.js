import { gsap } from "gsap";
import Splitting from "splitting";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function startWhatWeDoAnimation() {
  const section = document.querySelector(".what-we-do");
  const c1 = section.querySelector(".c1");
  const c2 = section.querySelector(".c2");
  const c3 = section.querySelector(".c3");
  const c2Frames = section.querySelector(".c2__frames");
  const c1Spans = section.querySelectorAll(".c1__words li span");

  const sectionRect = section.getBoundingClientRect();
  const sectionCenterX = sectionRect.left + sectionRect.width / 2;
  const sectionCenterY = sectionRect.top + sectionRect.height / 2;

  const c3Rect = c3.getBoundingClientRect();
  const naturalCenterX = c3Rect.left + c3Rect.width / 2;
  const naturalCenterY = c3Rect.top + c3Rect.height / 2;

  const dx = sectionCenterX - naturalCenterX;
  const dy = sectionCenterY - naturalCenterY;

  // Garante que c1 inicia invisível para evitar o "piscar"
  gsap.set(c1, { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  // Estado inicial da seção e das colunas
  tl.set(section, { opacity: 0, y: 100 });
  tl.set([c2, c3], { opacity: 0 });

  // Entrada da seção
  tl.to(section, { opacity: 1, y: 0, duration: 1 });

  // --- C3 ---
  tl.set(c3, {
    transformOrigin: "50% 50%",
    x: dx,
    y: sectionRect.height,
    scale: 0.75
  });
  tl.to(c3, { opacity: 1, x: dx, y: dy, duration: 1.2 });
  tl.to(c3, { duration: 0.3 }); // pausa
  tl.to(c3, { x: 0, y: 0, scale: 1, duration: 1 });

  // --- C2 ---
  tl.from(c2, { opacity: 0, scale: 0.5, duration: 1 }, "-=0.5");
  tl.to(c2, { opacity: 1, scale: 1, duration: 1 }, "-=0.5");
  tl.fromTo(c2Frames, { rotationX: 0 }, { rotationX: 360, duration: 1 }, "<");

  // --- C1 ---
  // Adiciona data-splitting se não existir e aplica o Splitting
  c1Spans.forEach(span => {
    if (!span.hasAttribute("data-splitting")) {
      span.setAttribute("data-splitting", "chars");
    }
  });
  Splitting({ target: ".c1__words li span" });

  // Seleciona os caracteres gerados e os inicializa com opacidade 0
  const chars = document.querySelectorAll(".c1__words li .char");
  gsap.set(chars, { opacity: 0 });

  // Revela c1 no momento certo (sem fade adicional)
  tl.set(c1, { opacity: 1 });
  tl.to({}, { duration: 0.1 });

  // Anima os caracteres de entrada
  tl.add(() => {
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

  // Pinagem com refresh no onEnter para garantir centralização
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=" + (tl.duration() * window.innerHeight),
    pin: true,
    scrub: 1,
    anticipatePin: 1,
    pinSpacing: true,
    onEnter: () => {
      ScrollTrigger.refresh();
    }
  });
}

// Sentinel disparando animação
document.addEventListener("DOMContentLoaded", () => {
  ScrollTrigger.create({
    trigger: ".trigger-end-about",
    start: "top center",
    once: true,
    onEnter: startWhatWeDoAnimation,
  });
});
