/* global Splitting */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// 1) Fragmenta texto e inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  Splitting();             // usa o Splitting UMD
  initScrollOrchestration();
});

// 2) Após carregar tudo, faz um refresh dos ScrollTriggers
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

function initScrollOrchestration() {
  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      initHeroEntry();
      initMainScrollTimeline();
    },
    "(max-width: 767px)": () => {
      const hero = document.querySelector(".hero-content");
      if (hero) {
        gsap.from(hero, { opacity: 0, duration: 0.8, ease: "power1.out" });
      }
    }
  });
}

let heroEntryTl;
function initHeroEntry() {
  const headings = document.querySelectorAll(".hero-content h2");
  if (!headings.length) return;

  heroEntryTl = gsap.timeline({ delay: 1 });
  headings.forEach((heading, i) => {
    const chars = heading.querySelectorAll(".char");
    heroEntryTl.fromTo(
      chars,
      { opacity: 0, rotationX: -90, z: -200, transformOrigin: "50% 0%" },
      { opacity: 1, rotationX: 0, z: 0, ease: "power1.out", stagger: 0.05, duration: 0.5 },
      i * 0.05
    );
  });
}

function initMainScrollTimeline() {
  const heroChars = document.querySelectorAll(".hero-content .char");
  const clipRects  = document.querySelectorAll("#heroClip rect");
  const aboutChars = document.querySelectorAll("#about-us .text-back .char");
  if (!heroChars.length || !clipRects.length || !aboutChars.length) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: () => `+=${window.innerHeight * 1.5}`,
      scrub: 0.5,
      pin: true,
      markers: true,
      pinSpacing: true,
      anticipatePin: 1
    }
  });

  tl.to(heroChars, { opacity: 0, rotationX: -90, z: -200, ease: "power1.out", stagger: 0.05, duration: 1 }, 0)
    .to(clipRects, { attr: { y: 0.5, height: 0 }, ease: "power2.inOut", stagger: 0.08, duration: 1 }, 0)
    .to({}, { duration: 1 }, 0)
    .fromTo(aboutChars,
      { scaleY: 0, opacity: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, opacity: 1, ease: "power3.in", stagger: 0.05 },
      "<"
    );

  if (heroEntryTl) {
    tl.add(heroEntryTl, 0);
  }
}
