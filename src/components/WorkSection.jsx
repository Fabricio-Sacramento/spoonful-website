// src/components/WorkSection.jsx

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

import WorkIntro from './WorkIntro';
import PortfolioSlide from './PortfolioSlide';
import { portfolio } from '../data/portfolio';

// registra plugins GSAP
gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

export default function WorkSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleciona cada slide para cálculos de snap
    const slides = gsap.utils.toArray(container.querySelectorAll('.work-slide'));
    const totalWidth = container.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = totalWidth - viewportWidth;

    // Contexto GSAP para escopo seguro
    const ctx = gsap.context(() => {
      // Timeline de scroll → horizontal + pin
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#work',           // pin no elemento <section id="work">
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: true,
          pin: true,
          anticipatePin: 1
        }
      });

      tl.to(container, { x: -scrollDistance, ease: 'none' });

      // Draggable + inertia + snap
      Draggable.create(container, {
        type: 'x',
        bounds: { minX: -scrollDistance, maxX: 0 },
        inertia: true,
        snap: {
          x: rawX => {
            const offsets = slides.map((_, i) =>
              -slides.slice(0, i).reduce((sum, el) => sum + el.offsetWidth, 0)
            );
            return offsets.reduce((closest, curr) =>
              Math.abs(curr - rawX) < Math.abs(closest - rawX) ? curr : closest
            , offsets[0]);
          },
          duration: 0.5
        },
        onDrag:        () => ScrollTrigger.update(),
        onThrowUpdate: () => ScrollTrigger.update()
      });

      // Skew dinâmico com base na velocidade
      gsap.ticker.add(() => {
        const vx = container._gsap?.velocityX || 0;
        const skew = gsap.utils.clamp(-15, 15, vx * 0.2);
        gsap.set(container, { skewX: skew });
      });

    }, container);

    // Cleanup ao desmontar
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="work-container">
      {/* Slide de título */}
      <div className="work-slide">
        <WorkIntro />
      </div>

      {/* Slides do portfólio */}
      {portfolio.map(item => (
        <div key={item.id} className="work-slide">
          <PortfolioSlide
            title={item.title}
            subtitle={item.subtitle}
            labels={item.categories}
            image={item.imageUrl}
          />
        </div>
      ))}
    </div>
  );
}
