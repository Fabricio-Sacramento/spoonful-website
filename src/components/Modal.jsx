import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Modal = ({ isOpen, onClose, project, projects, onNavigate }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Atualiza índice quando projeto muda
  useEffect(() => {
    if (project && projects) {
      const index = projects.findIndex(p => p.id === project.id);
      setCurrentProjectIndex(index);
    }
  }, [project, projects]);

  // Animação e controle de ScrollTrigger
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;
    
    if (isOpen) {
      // Pausar todos ScrollTriggers
      const triggers = ScrollTrigger.getAll();
      triggers.forEach(trigger => trigger.disable());
      
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
      
      // Animar entrada
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { scale: 0.9, opacity: 0, y: 20 });
      
      gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(contentRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay: 0.1,
        ease: 'power2.out'
      });
    } else {
      // Animar saída
      const tl = gsap.timeline({
        onComplete: () => {
          // Reativar ScrollTriggers
          const triggers = ScrollTrigger.getAll();
          triggers.forEach(trigger => trigger.enable());
          ScrollTrigger.refresh();
          
          // Liberar scroll
          document.body.style.overflow = '';
        }
      });
      
      tl.to(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      })
      .to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.2
      }, '-=0.1');
    }
    
    return () => {
      // Cleanup se componente desmontar
      if (!isOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigateProject('prev');
          break;
        case 'ArrowRight':
          navigateProject('next');
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentProjectIndex]);

  // Navegação entre projetos
  const navigateProject = (direction) => {
    if (!projects || !onNavigate) return;
    
    const totalProjects = projects.length;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentProjectIndex + 1) % totalProjects;
    } else {
      newIndex = (currentProjectIndex - 1 + totalProjects) % totalProjects;
    }
    
    // Animar transição
    gsap.to(contentRef.current, {
      opacity: 0,
      x: direction === 'next' ? -30 : 30,
      duration: 0.2,
      onComplete: () => {
        onNavigate(newIndex);
        gsap.fromTo(contentRef.current,
          { opacity: 0, x: direction === 'next' ? 30 : -30 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      }
    });
  };

  if (!isOpen || !project) return null;

  const nextProject = projects?.[(currentProjectIndex + 1) % projects.length];
  const prevProject = projects?.[(currentProjectIndex - 1 + projects.length) % projects.length];

  return (
    <div 
      ref={overlayRef}
      className="modal-overlay modal-overlay--enhanced"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={contentRef}
        className="modal-content modal-content--enhanced"
      >
        {/* Close Button */}
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>
        
        {/* Project Header */}
        <div className="modal-header">
          <div className="modal-tags">
            {project.tags?.map((tag, idx) => (
              <span key={idx} className="modal-tag">{tag}</span>
            ))}
          </div>
          <h1 className="modal-title">{project.title}</h1>
          <p className="modal-description">{project.description}</p>
        </div>

        {/* Hero Image */}
        {project.image && (
          <div className="modal-hero-image">
            <img 
              src={project.image} 
              alt={project.title}
              loading="lazy"
            />
          </div>
        )}

        {/* Project Navigation */}
        {projects && onNavigate && (
          <div className="modal-navigation">
            <button 
              className="modal-nav-btn modal-nav-btn--prev"
              onClick={() => navigateProject('prev')}
            >
              <span className="modal-nav-label">← Anterior</span>
              <span className="modal-nav-title">{prevProject?.title}</span>
            </button>
            
            <button 
              className="modal-nav-btn modal-nav-btn--next"
              onClick={() => navigateProject('next')}
            >
              <span className="modal-nav-label">Próximo →</span>
              <span className="modal-nav-title">{nextProject?.title}</span>
            </button>
          </div>
        )}
        
        {/* Placeholder para galeria futura */}
        <div className="modal-gallery-placeholder">
          <p style={{ 
            color: 'var(--neutral-light)', 
            textAlign: 'center', 
            padding: '4rem',
            opacity: 0.5 
          }}>
            Galeria de imagens será implementada na Fase 2
          </p>
        </div>
      </div>
    </div>
  );
};

export default Modal;