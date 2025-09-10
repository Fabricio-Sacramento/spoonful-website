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
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const snapTimeoutRef = useRef(null);

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

    // Função para calcular snap position
    const getSnapPosition = () => {
      const sectionWidth = section.offsetWidth;
      const currentX = gsap.getProperty(track, 'x');
      const cardWidth = sectionWidth; // Cada card ocupa 100vw
      
      // Calcula qual card está mais próximo do centro
      const currentIndex = Math.round(Math.abs(currentX) / cardWidth);
      const totalCards = projects.length + 1; // +1 para o card WORK
      
      // Limita o índice aos bounds válidos
      const clampedIndex = Math.max(0, Math.min(currentIndex, totalCards - 1));
      
      // Posição alvo para centralizar o card
      return -(clampedIndex * cardWidth);
    };

    // Função para executar snap
    const executeSnap = () => {
      const targetX = getSnapPosition();
      const currentX = gsap.getProperty(track, 'x');
      
      // Só faz snap se houver diferença significativa (mais de 10px)
      if (Math.abs(targetX - currentX) > 10) {
        gsap.to(track, {
          x: targetX,
          duration: 0.6,
          ease: 'power2.out'
        });
      }
    };

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
    
    // Timeline principal para coordenar todas as animações
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance + window.innerHeight * 0.5}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: 1,
        onUpdate: (self) => {
          // Detecta se está fazendo scroll
          const isScrolling = self.getVelocity() !== 0;
          
          if (isScrolling && !isScrollingRef.current) {
            // Começou a fazer scroll - reduz cards para 75%
            isScrollingRef.current = true;
            gsap.to('.work-card--project', {
              scale: 0.75,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
          
          // Clear timeout anterior e define novo
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          
          // Define timeout para quando parar de fazer scroll
          scrollTimeoutRef.current = setTimeout(() => {
            if (isScrollingRef.current) {
              // Parou de fazer scroll - volta cards para 100%
              isScrollingRef.current = false;
              gsap.to('.work-card--project', {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
              });
              
              // Executa snap após cards voltarem ao tamanho normal
              snapTimeoutRef.current = setTimeout(() => {
                executeSnap();
              }, 200);
            }
          }, 150); // 150ms de delay para detectar parada
        }
      }
    });

    // Animação 1: Movimento horizontal do track
    mainTimeline.to(track, {
      x: -distance,
      ease: 'none',
      duration: 1
    }, 0);

    // Animação 2: Scale da palavra WORK (1 → 4 → 1)
    // Durante a primeira parte do scroll (saída do card WORK)
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

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
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
        {/* Card WORK - Capa da seção */}
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

      {/* Modal */}
      <Modal 
        isOpen={modalOpen}
        onClose={closeModal}
        project={selectedProject}
      />
    </section>
  );
};

export default WorkSection;