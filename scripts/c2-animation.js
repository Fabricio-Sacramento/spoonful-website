import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const c1Items = document.querySelectorAll(".c1__words li");
  const c2FramesContainer = document.querySelector(".c2__frames");
  const frames = document.querySelectorAll(".c2__frames .frame");
  const totalFrames = frames.length;
  const anglePerFrame = 360 / totalFrames;
  const carouselRadius = 300;

  gsap.set(document.querySelector(".c2"), { perspective: 5000 });

  frames.forEach((frame, i) => {
    gsap.set(frame, {
      transform: `rotateX(${i * anglePerFrame}deg) translateZ(${carouselRadius}px)`,
      backfaceVisibility: "hidden"
    });
  });

  document.querySelectorAll(".frame-list").forEach(wrapper => {
    wrapper.style.transformOrigin = "left center";
  });

  let isAnimating = false;

  c1Items.forEach(item => {
    item.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      const currentActive = document.querySelector(".c1__words li.active");

      // Se houver um item ativo diferente do clicado, dispara a animação de saída
      if (currentActive && currentActive !== item) {
        currentActive.classList.add("exit");
        setTimeout(() => {
          currentActive.classList.remove("active", "exit");
        }, 400);
      }

      // Ativa o novo item
      if (!item.classList.contains("active")) {
        item.classList.add("active");
      }

      const targetClass = item.getAttribute("data-target");
      const targetFrame = document.querySelector("." + targetClass);
      if (!targetFrame) {
        isAnimating = false;
        return;
      }
      const index = Array.from(frames).indexOf(targetFrame);

      gsap.to(c2FramesContainer, {
        rotationX: -index * anglePerFrame,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          const currentRot = gsap.getProperty(c2FramesContainer, "rotationX");
          frames.forEach((frame, i) => {
            const effectiveAngle = i * anglePerFrame + currentRot;
            let textRot = -effectiveAngle;
            textRot = (textRot % 360 + 360) % 360;
            if (textRot > 90 && textRot < 270) {
              textRot += 180;
            }
            const textWrapper = frame.querySelector(".frame-list");
            gsap.set(textWrapper, { transform: `rotateX(${textRot}deg)` });
          });
        },
        onComplete: () => {
          frames.forEach(f => f.classList.remove("active"));
          targetFrame.classList.add("active");
          isAnimating = false;
        }
      });
    });
  });
});
