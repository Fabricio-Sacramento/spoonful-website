import { gsap } from "gsap";
import Splitting from "splitting";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".what-we-do");
  const c1 = section.querySelector(".c1");
  const c2 = section.querySelector(".c2");
  const c3 = section.querySelector(".c3");
  const c2Frames = section.querySelector(".c2__frames");
  const c1Spans = section.querySelectorAll(".c1__words li span");

  // Evita flicker inicial e posiciona seção abaixo
  gsap.set([section, c1, c2, c3], { opacity: 0 });
  gsap.set(section, { y: 100 });

  // Prepara Splitting para chars
  c1Spans.forEach(span => span.setAttribute("data-splitting", "chars"));
  Splitting({ target: ".c1__words li span" });
  const chars = section.querySelectorAll(".c1__words li .char");
  gsap.set(chars, { opacity: 0, rotationX: -90, z: -200, transformOrigin: "0% 50%" });

  // Calcula deslocamento inicial de C3 para voar ao centro da seção
  const sectionRect = section.getBoundingClientRect();
  const sectionCenterX = sectionRect.left + sectionRect.width / 2;
  const sectionCenterY = sectionRect.top + sectionRect.height / 2;
  const c3Rect = c3.getBoundingClientRect();
  const naturalCenterX = c3Rect.left + c3Rect.width / 2;
  const naturalCenterY = c3Rect.top + c3Rect.height / 2;
  const dx = sectionCenterX - naturalCenterX;
  const dy = sectionCenterY - naturalCenterY;

  // Timeline totalmente controlada pelo scroll
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: section,
      start: "top center",                                 // inicia pin quando o topo da seção atinge o centro
      end: () => "+=" + (section.offsetHeight * 1.5),      // 1.5× a própria altura da seção
      scrub: true,
      pin: true,
      anticipatePin: 1,
      pinSpacing: true
    }
  });

  // 1) Fade in + slide up da seção
  tl.to(section, { opacity: 1, y: 0, duration: 1 });

  // 2) C3 “voa” do bottom ao centro da seção
  tl.set(c3, { transformOrigin: "50% 50%", x: dx, y: window.innerHeight, scale: 0.75 });
  tl.to(c3, { opacity: 1, x: dx, y: dy, duration: 1.2 });
  tl.to(c3, { duration: 0.3 });
  tl.to(c3, { x: 0, y: 0, scale: 1, duration: 1 });

  // 3) C2 entra em seguida
  tl.fromTo(c2, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1 }, "-=0.5");
  tl.fromTo(c2Frames, { rotationX: 0 }, { rotationX: 360, duration: 1 }, "<");

  // 4) Texto em C1 revela char a char
  tl.set(c1, { opacity: 1 });
  tl.to({}, { duration: 0.1 });
  tl.to(chars, { opacity: 1, rotationX: 0, z: 0, duration: 0.5, stagger: 0.05, ease: "power1.out" });
});
