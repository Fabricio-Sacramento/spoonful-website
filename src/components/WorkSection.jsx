// src/components/WorkSection.jsx

import { useRef, useEffect } from 'react';
import WorkIntro from './WorkIntro';
import PortfolioSlide from './PortfolioSlide';
import { portfolio } from '../data/portfolio';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

export default function WorkSection() {
  const container = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

    // captura o elemento uma única vez
    const el = container.current;

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray('.work-slide');
      const totalWidth = el.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = totalWidth - viewportWidth;

      // 1) Scroll vertical → horizontal
      gsap.to(el, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 2) Drag + inertia + snapping
      Draggable.create(el, {
        type: 'x',
        bounds: { minX: -scrollDistance, maxX: 0 },
        inertia: true,
        snap: {
          x: rawX => {
            const points = slides.map((_, i) => -i * viewportWidth);
            return points.reduce((prev, curr) =>
              Math.abs(curr - rawX) < Math.abs(prev - rawX) ? curr : prev
            , points[0]);
          },
        },
        onDrag:         () => ScrollTrigger.update(),
        onThrowUpdate:  () => ScrollTrigger.update(),
        onDragStart()   { gsap.set(el, { skewX: 0 }); },
        onDragEnd()     { gsap.to(el, { skewX: 0, duration: 0.5, ease: 'power3.out' }); },
        onThrowComplete() { gsap.to(el, { skewX: 0, duration: 0.5, ease: 'power3.out' }); },
      });

      // 3) Skew dinâmico durante drag/inertia
      gsap.ticker.add(() => {
        const vx = el._gsap.velocityX || 0;
        const skew = gsap.utils.clamp(-15, 15, vx * 0.2);
        gsap.set(el, { skewX: skew });
      });
    }, container);

    return () => {
      // reverte todas as animações/tweens criadas no contexto
      ctx.revert();

      // mata somente os ScrollTriggers deste container
      ScrollTrigger.getAll()
        .filter(st => st.trigger === el)
        .forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={container} className="work-container">
      <div className="work-slide">
        <WorkIntro />
      </div>
      {portfolio.map(item => (
        <div key={item.id} className="work-slide">
          <PortfolioSlide {...item} />
        </div>
      ))}
    </div>
  );
}
