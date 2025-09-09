import { useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WorkSection = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  // Dados dos projetos do portfolio
  const projects = [
    {
      id: 1,
      title: "Itaway Ecotours",
      description: "E-commerce platform for sustainable travel experiences",
      tags: ["WEBSITE", "E-COMMERCE", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://itaway-ecotours.com",
      backgroundColor: "var(--primary-green)"
    },
    {
      id: 2,
      title: "TropiView",
      description: "Visual identity and editorial design for tropical research",
      tags: ["VISUAL IDENTITY", "EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT"],
      image: "/images/projects/tropiview.jpg",
      projectUrl: "https://tropiview.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 3,
      title: "Humaita Digital",
      description: "Digital platform for urban development initiatives",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/images/projects/humaita-digital.jpg",
      projectUrl: "https://humaita-digital.com",
      backgroundColor: "var(--primary-green)"
    },
    {
      id: 4,
      title: "Hysteria",
      description: "Contemporary art gallery digital presence",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/images/projects/hysteria.jpg",
      projectUrl: "https://hysteria.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 5,
      title: "myHABITAT",
      description: "IoT-driven environmental monitoring platform",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/images/projects/myhabitat.jpg",
      projectUrl: "https://myhabitat.com",
      backgroundColor: "var(--primary-green)"
    },
    {
      id: 6,
      title: "Vale EnvironPact",
      description: "Environmental impact documentation and design",
      tags: ["EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT"],
      image: "/images/projects/vale-environpact.jpg",
      projectUrl: "https://vale-environpact.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 7,
      title: "HB",
      description: "Art direction and 3D visualization project",
      tags: ["ART DIRECTION", "ILLUSTRATION", "MOTION", "3D"],
      image: "/images/projects/hb.jpg",
      projectUrl: "https://hb-project.com",
      backgroundColor: "var(--primary-green)"
    },
    {
      id: 8,
      title: "Crypto Beerfest",
      description: "Visual identity for blockchain-themed event",
      tags: ["VISUAL IDENTITY", "ILLUSTRATION", "GRAPHIC DESIGN", "MOTION GRAPHICS", "3D"],
      image: "/images/projects/crypto-beerfest.jpg",
      projectUrl: "https://crypto-beerfest.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 9,
      title: "Urban Woof NYC",
      description: "Branding and booking platform for dog services",
      tags: ["BRANDING", "WEBSITE", "BOOKING SOLUTION", "UIUX", "DEVELOPMENT"],
      image: "/images/projects/urban-woof-nyc.jpg",
      projectUrl: "https://urban-woof-nyc.com",
      backgroundColor: "var(--primary-green)"
    },
    {
      id: 10,
      title: "Tangente DIY Skateparks",
      description: "Brand identity for custom skatepark construction",
      tags: ["BRANDING", "VISUAL IDENTITY"],
      image: "/images/projects/tangente-diy.jpg",
      projectUrl: "https://tangente-diy.com",
      backgroundColor: "var(--primary-red)"
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
        gap: '0'
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
      })
    });

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
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
          gap: '0',
          width: 'max-content',
          willChange: 'transform'
        }}
      >
        {/* Card WORK - Capa da seção */}
        <div 
          className="work-card work-card--intro"
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--primary-red)',
            flexShrink: 0
          }}
        >
          <h1 className="work-intro-title">WORK</h1>
        </div>

        {/* Cards de projetos */}
        {projects.map((project) => (
          <article 
            key={project.id}
            className="work-card work-card--project"
            style={{
              display: 'flex',
              width: '100vw',
              height: '100vh',
              alignItems: 'center',
              background: project.backgroundColor,
              flexShrink: 0
            }}
          >
            {/* Split Esquerda: Imagem */}
            <div 
              className="work-card__image-section"
              style={{
                display: 'flex',
                width: '50%',
                height: '100vh',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div className="work-card__image-container">
                <img 
                  src={project.image} 
                  alt={project.title}
                  loading="lazy"
                  className="work-card__image"
                />
              </div>
            </div>

            {/* Split Direita: Conteúdo */}
            <div 
              className="work-card__content-section"
              style={{
                display: 'flex',
                padding: '8rem 0',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                flex: '1 0 0',
                alignSelf: 'stretch'
              }}
            >
              {/* Tags */}
              <div 
                className="work-card__tags"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '2rem'
                }}
              >
                {project.tags.map((tag, index) => (
                  <span key={index} className="work-card__tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Título */}
              <h2 className="work-card__title">
                {project.title}
              </h2>

              {/* Descrição */}
              <p className="work-card__description">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WorkSection;