import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const c1Items = document.querySelectorAll(".c1__words li");
  const c2FramesContainer = document.querySelector(".c2__frames");
  const frames = document.querySelectorAll(".c2__frames .frame");
  const totalFrames = frames.length;
  const anglePerFrame = 360 / totalFrames;
  const carouselRadius = 300; // Valor em px

  // Define a perspectiva no container .c2
  gsap.set(document.querySelector(".c2"), { perspective: 1000 });

  // Posiciona cada frame para distribuí-los em um cilindro 3D
  frames.forEach((frame, i) => {
    gsap.set(frame, {
      transform: `rotateX(${i * anglePerFrame}deg) translateZ(${carouselRadius}px)`,
      backfaceVisibility: "hidden"
    });
  
    // Ajusta a rotação do texto para compensar a rotação do frame
    const textWrapper = frame.querySelector(".frame-list");
    gsap.set(textWrapper, {
      transform: `rotateX(${-i * anglePerFrame}deg)`
    });
  });

  let isAnimating = false;

  c1Items.forEach(item => {
    item.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;
  
      c1Items.forEach(el => el.classList.remove("active"));
      item.classList.add("active");
  
      const targetClass = item.getAttribute("data-target");
      const targetFrame = document.querySelector("." + targetClass);
      if (!targetFrame) return;
      
      // A variável "index" é definida aqui, dentro do callback, onde "frames" está acessível
      const index = Array.from(frames).indexOf(targetFrame);
  
      gsap.to(c2FramesContainer, {
        // Rota o container para que o frame selecionado fique centralizado
        rotationX: -index * anglePerFrame,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
          isAnimating = false;
        }
      });
    });
  });
});
