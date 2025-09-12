import { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Modal from './Modal';

gsap.registerPlugin(ScrollTrigger);

const WorkSection = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const workTitleRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  // Estado do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Função para abrir modal
  const openModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  // Função para fechar modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  // Dados dos projetos do portfolio
  const projects = [
    {
      id: 1,
      title: "Itaway Ecotours",
      description: "E-commerce platform for sustainable travel experiences",
      tags: ["WEBSITE", "E-COMMERCE", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://itaway-ecotours.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 2,
      title: "TropiView",
      description: "Visual identity and editorial design for tropical research",
      tags: ["VISUAL IDENTITY", "EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://tropiview.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 3,
      title: "Humaita Digital",
      description: "Digital platform for urban development initiatives",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://humaita-digital.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 4,
      title: "Hysteria",
      description: "Contemporary art gallery digital presence",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://hysteria.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 5,
      title: "myHABITAT",
      description: "IoT-driven environmental monitoring platform",
      tags: ["WEBSITE", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://myhabitat.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 6,
      title: "Vale EnvironPact",
      description: "Environmental impact documentation and design",
      tags: ["EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://vale-environpact.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 7,
      title: "HB",
      description: "Art direction and 3D visualization project",
      tags: ["ART DIRECTION", "ILLUSTRATION", "MOTION", "3D"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://hb-project.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 8,
      title: "Crypto Beerfest",
      description: "Visual identity for blockchain-themed event",
      tags: ["VISUAL IDENTITY", "ILLUSTRATION", "GRAPHIC DESIGN", "MOTION GRAPHICS", "3D"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://crypto-beerfest.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 9,
      title: "Urban Woof NYC",
      description: "Branding and booking platform for dog services",
      tags: ["BRANDING", "WEBSITE", "BOOKING SOLUTION", "UIUX", "DEVELOPMENT"],
      image: "/src/assets/images/New-Flakes-02.jpg",
      projectUrl: "https://urban-woof-nyc.com",
      backgroundColor: "var(--primary-red)"
    },
    {
      id: 10,
      title: "Tangente DIY Skateparks",
      description: "Brand identity for custom skatepark construction",
      tags: ["BRANDING", "VISUAL IDENTITY"],
      image: "/src/assets/images/New-Flakes-02.jpg",
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
      const sectionWidth = section.offsetWidth;
      const total = projects.length + 1;
      return (total * sectionWidth) - sectionWidth;
    };

    // Mobile: layout vertical
    if (window.innerWidth < 1024) {
      gsap.set(track, {
        flexDirection: 'column',
        width: '100%',
        gap: '0'
      });

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

    // Desktop: scroll horizontal COM SNAP NATIVO + SKEW EFFECT
    const totalCards = projects.length + 1; // WORK + projetos
    const step = 1 / (totalCards - 1);
    const clamper = gsap.utils.clamp(-8, 8); // Skew mais sutil que o original (-20, 20)
    let resetTimeout;

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${calculateDistance()}`, // SEM o + window.innerHeight * 0.5
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1,
        snap: {
          snapTo: (value) => gsap.utils.snap(step, value),
          duration: 0.6,
          ease: "power2.out",
          delay: 0.15,
          onStart: () => {
            // Reset skew quando snap inicia
            gsap.to(track, { // Reset no container track
              skewX: 0,
              duration: 0.4,
              ease: "power2.out"
            });
          }
        },
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          
          // Se velocidade for muito baixa, força skew zero
          const skew = Math.abs(velocity) < 40 ? 0 : clamper(velocity / -300);
          
          gsap.set('.work-card--project', {
            skewX: skew,
            transformOrigin: "center center"
          });
            clearTimeout(resetTimeout);
            resetTimeout = setTimeout(() => {
              gsap.set('.work-card--project', { skewX: 0 });
          }, 100);
        }
      }
    });

    // Movimento horizontal
    mainTimeline.to(track, {
      x: () => -calculateDistance(),
      ease: 'none',
      duration: 1
    }, 0);

    // Animação da palavra WORK
    const workTitle = workTitleRef.current;
    if (workTitle) {
      mainTimeline
        .to(workTitle, {
          scale: 4,
          ease: 'power2.out',
          duration: 0.3
        }, 0)
        .to(workTitle, {
          scale: 1,
          ease: 'power2.out',
          duration: 0.3
        }, 0.3);
    }

    scrollTriggerRef.current = mainTimeline.scrollTrigger;

    // Cleanup
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      mainTimeline.kill();
    };

  }, [projects.length]);

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
        {/* Card WORK */}
        <div 
          className="work-card work-card--intro"
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '5vw',
            backgroundColor: 'var(--primary-red)',
            flexShrink: 0
          }}
        >
          <h1 ref={workTitleRef} className="work-intro-title">WORK</h1>
        </div>

        {/* Cards de projetos */}
        {projects.map((project) => (
          <article 
            key={project.id}
            className="work-card work-card--project"
            onClick={() => openModal(project)}
            style={{
              display: 'flex',
              width: '100vw',
              height: '100vh',
              alignItems: 'center',
              background: project.backgroundColor,
              flexShrink: 0
            }}
          >
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

              <h2 className="work-card__title">
                {project.title}
              </h2>

              <p className="work-card__description">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <Modal 
        isOpen={modalOpen}
        onClose={closeModal}
        project={selectedProject}
      />
    </section>
  );
};

export default WorkSection;