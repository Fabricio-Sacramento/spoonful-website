import { useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WorkSection = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  // Mock data - substitua pelos seus projetos reais
  const projects = [
    {
      id: 1,
      title: "Projeto 1",
      description: "Branding & Digital Experience",
      image: "placeholder.jpg"
    },
    {
      id: 2,
      title: "Projeto 2", 
      description: "UI/UX & Development",
      image: "placeholder.jpg"
    },
    {
      id: 3,
      title: "Projeto 3",
      description: "Motion & 3D", 
      image: "placeholder.jpg"
    },
    {
      id: 4,
      title: "Projeto 4",
      description: "Digital Strategy",
      image: "placeholder.jpg"
    }
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    
    if (!section || !track) return;

    // Calcula bounds dinamicamente
    const calculateDistance = () => {
      const trackWidth = track.scrollWidth;
      const sectionWidth = section.offsetWidth;
      return trackWidth - sectionWidth;
    };

    // Mobile: layout vertical
    if (window.innerWidth < 1024) {
      gsap.set(track, {
        flexDirection: 'column',
        width: '100%',
        gap: '2rem'
      });

      // Animação simples de entrada
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        onEnter: () => {
          gsap.to('.work-card', {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
          });
        }
      });

      return;
    }

    // Desktop: scroll horizontal
    const distance = calculateDistance();
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${distance + window.innerHeight * 0.5}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      refreshPriority: 1,
      animation: gsap.to(track, {
        x: -distance,
        ease: 'none'
      }),
      onUpdate: () => {
        // Opcional: adicionar efeitos baseados no progresso
        // console.log('Scroll progress:', self.progress);
      }
    });

    // Animação de entrada dos cards
    gsap.fromTo('.work-card', 
      {
        y: 60,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.getById('work-cards-animation')?.kill();
    };

  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="work" 
      className="work-section"
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        ref={trackRef}
        className="work-track"
        style={{
          display: 'flex',
          gap: '3rem',
          width: 'max-content',
          willChange: 'transform'
        }}
      >
        {projects.map((project) => (
          <article 
            key={project.id}
            className="work-card"
            style={{
              flexShrink: 0,
              width: '600px', // Aumentado de 400px para 600px
              opacity: 0, // Para animação de entrada
              transform: 'translateY(60px)' // Para animação de entrada
            }}
          >
            <figure className="work-card__media">
              <img 
                src={project.image} 
                alt={project.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </figure>
            <div className="work-card__content">
              <h3 className="heading-medium">{project.title}</h3>
              <p className="work-card__description">{project.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WorkSection;