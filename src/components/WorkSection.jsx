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
    const root = el.parentNode; // container pai, normalmente <div id="work-root">

    // coleta todos os slides e calcula dimensões
    const slides = gsap.utils.toArray(el.querySelectorAll('.work-slide'));
    if (slides.length < 2) return;
    const totalWidth = el.scrollWidth;
    const scrollDistance = totalWidth - window.innerWidth;
    const offsets = slides.map((_, i) =>
      -slides.slice(0, i).reduce((sum, slide) => sum + slide.offsetWidth, 0)
    );

    // cria contexto para scoping das animações
    const ctx = gsap.context(() => {
      // ─── Pin horizontal da seção WORK ───────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: root,
           start: 'top top',
          end: () => `300%`,
          markers: true,
          pin: true,
          pinSpacing: false,
          scrub: true,
          anticipatePin: 1,
          onUpdate(self) {
            const skew = gsap.utils.clamp(-15, 15, self.getVelocity() * 0.2);
            gsap.set(el, { skewX: skew });
          }
        }
      })
      .to(el, { x: -scrollDistance, ease: 'none' });

      // ─── Drag + inertia + snap ───────────────────────────────────────
      Draggable.create(el, {
        type: 'x',
        bounds: { minX: -scrollDistance, maxX: 0 },
        inertia: true,
        snap: {
          x(rawX) {
            return offsets.reduce(
              (closest, curr) =>
                Math.abs(curr - rawX) < Math.abs(closest - rawX) ? curr : closest,
              offsets[0]
            );
          }
        },
        onDrag() {
          const v = this.getVelocity();
          gsap.set(el, { skewX: gsap.utils.clamp(-15, 15, v * 0.2) });
          ScrollTrigger.update();
        },
        onThrowUpdate() {
          const v = this.getVelocity();
          gsap.set(el, { skewX: gsap.utils.clamp(-15, 15, v * 0.2) });
          ScrollTrigger.update();
        }
      });
    }, containerRef);

    // cleanup ao desmontar
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
      Draggable.get(el)?.forEach(d => d.kill && d.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="work-container">
      <div className="work-slide">
        <WorkIntro />
      </div>
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
