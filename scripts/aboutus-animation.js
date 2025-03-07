import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  const debug = false; // Altere para true para ver os markers

  // Define o estado inicial: o texto amarelo começa 100% abaixo (fora de vista)
  gsap.set(".text-front .line span", { x: "-100%" });

  // Pin na seção About Us com intervalo de scroll maior (ajuste end se precisar)
  ScrollTrigger.create({
    trigger: "#about-us",
    start: "top top",
    end: "+=200%",  // aumenta o tempo de animação
    pin: true,
    scrub: true,
    markers: debug,
  });

  // Animação de revelação: move os spans de y:100% para y:0%
  gsap.to(".text-front .line span", {
    x: "0%",
    ease: "power2.out",
    stagger: 0.1,
    duration: 0.6,
    scrollTrigger: {
      trigger: "#about-us",
      start: "top top",
      end: "+=200%",
      scrub: true,
      markers: debug,
    }
  });
});
