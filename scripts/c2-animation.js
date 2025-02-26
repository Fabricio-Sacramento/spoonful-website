import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const c1Items = document.querySelectorAll(".c1__words li");
  const c2Frames = document.querySelector(".c2__frames");

  let isAnimating = false;

  c1Items.forEach(item => {
    item.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      // Atualiza os itens da C1
      c1Items.forEach(el => el.classList.remove("active"));
      item.classList.add("active");

      const targetClass = item.getAttribute("data-target");
      const targetFrame = document.querySelector("." + targetClass);

      if (!targetFrame) return;

      // Calcula a posição para centralizar o frame em C2
      const frameRect = targetFrame.getBoundingClientRect();
      const containerRect = c2Frames.getBoundingClientRect();
      const c2Height = document.querySelector(".c2").clientHeight;
      const targetPosition = -(frameRect.top - containerRect.top) + (c2Height / 2 - targetFrame.clientHeight / 2);

      // Atualiza os frames: remove active de todos e, com um pequeno atraso, adiciona active no frame alvo
      document.querySelectorAll(".frame").forEach(frame => frame.classList.remove("active"));
      setTimeout(() => {
         targetFrame.classList.add("active");
      }, 50);

      // Animação GSAP para reposicionar a coluna C2
      gsap.to(c2Frames, {
        y: targetPosition,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
          isAnimating = false;
        }
      });
    });
  });
});
