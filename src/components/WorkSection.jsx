// src/components/WorkSection.jsx

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

import WorkIntro from './WorkIntro';
import PortfolioSlide from './PortfolioSlide';
import { portfolio } from '../data/portfolio';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

export default function WorkSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const section = el.closest('#work');
    if (!section) {
      console.warn('Section #work não encontrada');
      return;
    }

    const slides = gsap.utils.toArray(el.querySelectorAll('.work-slide'));
    const totalWidth = el.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = totalWidth - viewportWidth;

    // Ajusta a altura da seção para permitir o scroll horizontal
    section.style.height = `${window.innerHeight + scrollDistance}px`;
    ScrollTrigger.refresh();

    // Cálculo dos offsets para snap
    const offsets = slides.map((_, i) =>
      -slides.slice(0, i).reduce((sum, slide) => sum + slide.offsetWidth, 0)
    );

    const ctx = gsap.context(() => {
      // Timeline de scroll horizontal com pin
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: true,
          pin: true,
          pinSpacing: false,       // remove o placeholder extra no fluxo
          anticipatePin: 1,
          onUpdate(self) {
            // Skew baseado na velocidade do scroll
            const skew = gsap.utils.clamp(-15, 15, self.getVelocity() * 0.2);
            gsap.set(el, { skewX: skew });
          }
        }
      }).to(el, { x: -scrollDistance, ease: 'none' });

      // Draggable para permitir arrastar no desktop/mobile
      Draggable.create(el, {
        type: 'x',
        bounds: { minX: -scrollDistance, maxX: 0 },
        inertia: true,
        snap: {
          x(rawX) {
            return offsets.reduce((closest, curr) =>
              Math.abs(curr - rawX) < Math.abs(closest - rawX) ? curr : closest
            , offsets[0]);
          },
          duration: 0.5
        },
        onDrag() {
          // fallback caso getVelocity não exista
          let v = 0;
          if (typeof this.getVelocity === 'function') {
            v = this.getVelocity('x');
          }
          const skew = gsap.utils.clamp(-15, 15, v * 0.2);
          gsap.set(el, { skewX: skew });
          ScrollTrigger.update();
        },
        onThrowUpdate() {
          let v = 0;
          if (typeof this.getVelocity === 'function') {
            v = this.getVelocity('x');
          }
          const skew = gsap.utils.clamp(-15, 15, v * 0.2);
          gsap.set(el, { skewX: skew });
          ScrollTrigger.update();
        }
      });
    }, containerRef);

    return () => {
      // remove animações e instâncias do contexto
      ctx.revert();
      // mata os Draggables
      Draggable.get(el)?.forEach(d => d.kill && d.kill());
      // mata todos os ScrollTriggers
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="work-container">
      <div className="work-slide"><WorkIntro /></div>
      {portfolio.map(item => (
        <div key={item.id} className="work-slide">
          <PortfolioSlide
            title={item.title}
            subtitle={item.subtitle}
            labels={item.categories}
            image={item.imageUrl}
            link={item.link}
          />
        </div>
      ))}
    </div>
  );
}
