import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

const Modal = ({ isOpen, onClose, project, projects = [] }) => {
  const modalRef = useRef(null);
  const firstImageRef = useRef(null);
  const rafRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation control refs
  const animRef = useRef({ isAnimating: false, suppressScroll: false });

  // Handle open animation - Phase 2 Otimizada
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const modal = modalRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlayDuration = prefersReducedMotion ? 80 : 260;
    const staggerStep = prefersReducedMotion ? 20 : 60;
    
    // Set animation flags
    animRef.current.isAnimating = true;
    animRef.current.suppressScroll = true;
    
    // Set initial state
    modal.classList.add('modal-overlay--entering');
    
    requestAnimationFrame(() => {
      // Start overlay animation
      modal.classList.remove('modal-overlay--entering');
      modal.classList.add('modal-overlay--visible');
      
      const hero = modal.querySelector('.modal-hero');
      
      if (hero) {
        // Apply stagger delays
        const items = Array.from(hero.querySelectorAll('[data-reveal]'));
        items.forEach((el, i) => {
          el.style.transitionDelay = `${i * staggerStep}ms`;
        });

        // Start reveal after overlay completes
        const timeoutId = setTimeout(() => {
          hero.classList.add('modal-hero--visible');
          
          // Release scroll immediately (don't wait for stagger)
          animRef.current.isAnimating = false;
          animRef.current.suppressScroll = false;
        }, overlayDuration);
        
        // Return cleanup function with timeoutId in closure
        return () => {
          // Cleanup
          clearTimeout(timeoutId);
          modal.classList.remove('modal-overlay--entering', 'modal-overlay--visible');
          
          const hero = modal.querySelector('.modal-hero');
          if (hero) {
            hero.classList.remove('modal-hero--visible');
            hero.querySelectorAll('[data-reveal]').forEach(el => {
              el.style.transitionDelay = '';
            });
          }
        };
      }
      
      // Focus management
      const closeButton = modal.querySelector('button[aria-label="Fechar modal"]');
      if (closeButton) {
        setTimeout(() => closeButton.focus(), overlayDuration + 100);
      }
    });
    
    return () => {
      // Default cleanup when no hero found
      modal.classList.remove('modal-overlay--entering', 'modal-overlay--visible');
    };
  }, [isOpen]);

  // Scroll-driven animation for first image
  useEffect(() => {
    if (!isOpen || !firstImageRef.current || !modalRef.current) return;

    const scroller = modalRef.current;
    const target = firstImageRef.current;
    const currentAnimRef = animRef.current;
    let running = true;
    let rootHalf = scroller.clientHeight / 2;

    target.style.setProperty('--expand-radius', '25px');
    target.style.setProperty('--expand-scale', '0.9');

    const computeAndApply = () => {
      if (!running) return;
      if (currentAnimRef.suppressScroll || currentAnimRef.isAnimating) {
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const elemTop = targetRect.top - scrollerRect.top;
      const progress = clamp((rootHalf - elemTop) / rootHalf, 0, 1);
      const scale = 0.9 + 0.12 * progress;
      const radius = 25 * (1 - progress);

      target.style.setProperty('--expand-scale', String(scale));
      target.style.setProperty('--expand-radius', `${radius}px`);
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        computeAndApply();
      });
    };

    const onResize = () => {
      rootHalf = scroller.clientHeight / 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => computeAndApply());
    };

    computeAndApply();

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const innerImg = target.querySelector('img');
    const onImgLoad = () => {
      rootHalf = scroller.clientHeight / 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => computeAndApply());
    };
    if (innerImg && !innerImg.complete) {
      innerImg.addEventListener('load', onImgLoad, { once: true });
    }

    return () => {
      running = false;
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      
      target.style.removeProperty('--expand-scale');
      target.style.removeProperty('--expand-radius');
      
      currentAnimRef.isAnimating = false;
      currentAnimRef.suppressScroll = false;
      
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (innerImg && onImgLoad) {
        try {
          innerImg.removeEventListener('load', onImgLoad);
        } catch (err) {
          console.warn('Error removing image load listener', err);
        }
      }
    };
  }, [isOpen, currentIndex]);

  // Find current project index
  useEffect(() => {
    if (project && projects.length > 0) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  // Navigation with infinite loop
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? projects.length - 1 : prev - 1);
  }, [projects.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev === projects.length - 1 ? 0 : prev + 1);
  }, [projects.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || projects.length === 0) return null;

  const currentProject = projects[currentIndex];
  const prevProject = projects[currentIndex === 0 ? projects.length - 1 : currentIndex - 1];
  const nextProject = projects[currentIndex === projects.length - 1 ? 0 : currentIndex + 1];

  const modalContent = (
    <div 
      ref={modalRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--neutral-normal)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          width: '48px',
          height: '48px',
          background: 'rgba(235, 235, 235, 0.1)',
          border: 'none',
          borderRadius: '50%',
          color: 'var(--neutral-light)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(235, 235, 235, 0.2)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(235, 235, 235, 0.1)'}
        aria-label="Fechar modal"
      >
        ×
      </button>

      {/* HERO SECTION com classe modal-hero e data-reveal */}
      <div className="modal-hero" style={{
        width: '100%',
        height: '50vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: 'var(--neutral-normal)',
        padding: '2.25rem',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '0.5rem',
        overflow: 'hidden'
      }}>
        {/* Tags */}
        <div data-reveal style={{
          color: 'var(--primary-green)',
          fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '600',
          letterSpacing: '0.045rem',
          textTransform: 'capitalize'
        }}>
          {currentProject.tags?.join(' • ') || 'WEBSITE • E-COMMERCE • UI/UX • DEVELOPMENT'}
        </div>

        {/* Title */}
        <h1 data-reveal style={{
          color: 'var(--neutral-light)',
          fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
          fontSize: '7.75rem',
          fontWeight: '900',
          letterSpacing: '0.155rem',
          margin: 0
        }}>
          {currentProject.title}
        </h1>

        {/* Description Row */}
        <div data-reveal style={{ display: 'flex', width: '100%', gap: '2rem' }}>
          {/* Left Column - Title & Description (50%) */}
          <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.375rem',
              fontWeight: '600',
              letterSpacing: '0.055rem',
              margin: 0
            }}>
              Plataforma de Ecoturismo Sustentável
            </h2>
            
            <p style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.25rem',
              fontWeight: '200',
              letterSpacing: '0.0625rem',
              margin: 0
            }}>
              Plataforma completa para experiências de turismo sustentável, com sistema de reservas, pagamentos integrados e dashboard para operadores locais. Designing interfaces and experiences that guide users intuitively. From wireframes to usability testing, we ensure your product is both attractive and effortless.
            </p>
          </div>

          {/* Middle Column - Stacks (25%) */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.0625rem',
                fontWeight: '600',
                letterSpacing: '0.0425rem',
                textTransform: 'capitalize',
                margin: '0 0 0.5rem 0'
              }}>
                Design Stack
              </h3>
              <p style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.25rem',
                fontWeight: '200',
                letterSpacing: '0.0625rem',
                textTransform: 'capitalize',
                margin: 0
              }}>
                Brand Strategy, UI/UX, Graphic Design, Front-end & Backend Development
              </p>
            </div>

            <div>
              <h3 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.0625rem',
                fontWeight: '600',
                letterSpacing: '0.0425rem',
                textTransform: 'capitalize',
                margin: '0 0 0.5rem 0'
              }}>
                Tech Stack
              </h3>
              <p style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.25rem',
                fontWeight: '200',
                letterSpacing: '0.0625rem',
                textTransform: 'capitalize',
                margin: 0
              }}>
                React • Node.js • Stripe • MongoDB
              </p>
            </div>
          </div>

          {/* Right Column - Go Live (25%) */}
          <div style={{ flex: '1' }}>
            {currentProject.projectUrl && (
              <div>
                <h3 style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: '600',
                  letterSpacing: '0.0425rem',
                  textTransform: 'capitalize',
                  margin: '0 0 0.5rem 0'
                }}>
                  Go Live
                </h3>
                <a 
                  href={currentProject.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--primary-green)',
                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                    fontSize: '1.25rem',
                    fontWeight: '400',
                    letterSpacing: '0.0625rem',
                    textTransform: 'capitalize',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY SECTION - 5 imagens sequenciais */}
      <div style={{
        backgroundColor: 'var(--neutral-normal)',
        padding: 0,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* PRIMEIRA IMAGEM - Com animação expansiva */}
          <div 
            ref={firstImageRef}
            style={{
              width: '100%',
              height: 'calc(100vh - 1rem)',
              padding: 0,
              overflow: 'hidden',
              position: 'relative',
              transformOrigin: 'center bottom',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--expand-radius, 25px)',
              overflow: 'hidden',
              backgroundColor: 'var(--neutral-normal)',
              transform: 'scale(var(--expand-scale, 1))',
              transformOrigin: 'center bottom',
              willChange: 'transform, border-radius',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
            }}>
              <img 
                src={currentProject.image}
                alt={`${currentProject.title} - Gallery 1`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* IMAGENS 2-5 - Já no estado expandido */}
          {[...Array(4)].map((_, i) => (
            <div key={i + 1} style={{
              width: '100%',
              height: '100vh',
              marginLeft: 0,
              marginRight: 0,
              padding: 0,
              borderRadius: '0',
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box'
            }}>
              <img 
                src={currentProject.image}
                alt={`${currentProject.title} - Gallery ${i + 2}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION SECTION - Layout 2x2 */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--primary-red)',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        {/* ROW 1 - Previous Project */}
        <div style={{
          height: '50vh',
          display: 'flex',
          width: '100%'
        }}>
          {/* Previous Project Info - LEFT */}
          <button
            onClick={goToPrevious}
            style={{
              width: '50%',
              height: '100%',
              backgroundColor: 'var(--primary-red)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '0.5rem',
              textAlign: 'right',
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              const button = e.currentTarget;
              const title = button.querySelector('h2');
              const label = button.querySelector('span:first-child');
              const tags = button.querySelector('span:last-child');
              
              title.style.transform = 'scale(1.2)';
              label.style.transform = 'translateY(-0.5rem)';
              tags.style.transform = 'translateY(0.5rem)';
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget;
              const title = button.querySelector('h2');
              const label = button.querySelector('span:first-child');
              const tags = button.querySelector('span:last-child');
              
              title.style.transform = 'scale(1)';
              label.style.transform = 'translateY(0)';
              tags.style.transform = 'translateY(0)';
            }}
          >
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '2.8125rem',
              fontWeight: '100',
              letterSpacing: '0.9px',
              lineHeight: '1.3',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              Previous project
            </span>
            
            <h2 style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '6.25rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              lineHeight: '0.8',
              margin: 0,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'right center'
            }}>
              {prevProject.title}
            </h2>
            
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.3125rem',
              fontWeight: '400',
              letterSpacing: '0.84px',
              textTransform: 'uppercase',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {prevProject.tags?.join(' • ')}
            </span>
          </button>

          {/* Previous Project Image - RIGHT */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img 
              src={prevProject.image}
              alt={prevProject.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
        </div>

        {/* ROW 2 - Next Project */}
        <div style={{
          height: '50vh',
          display: 'flex',
          width: '100%'
        }}>
          {/* Next Project Image - LEFT */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img 
              src={nextProject.image}
              alt={nextProject.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>

          {/* Next Project Info - RIGHT */}
          <button
            onClick={goToNext}
            style={{
              width: '50%',
              height: '100%',
              backgroundColor: 'var(--primary-red)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '0.5rem',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              const button = e.currentTarget;
              const title = button.querySelector('h2');
              const label = button.querySelector('span:first-child');
              const tags = button.querySelector('span:last-child');
              
              title.style.transform = 'scale(1.2)';
              label.style.transform = 'translateY(-0.5rem)';
              tags.style.transform = 'translateY(0.5rem)';
            }}
            onMouseLeave={(e) => {
              const button = e.currentTarget;
              const title = button.querySelector('h2');
              const label = button.querySelector('span:first-child');
              const tags = button.querySelector('span:last-child');
              
              title.style.transform = 'scale(1)';
              label.style.transform = 'translateY(0)';
              tags.style.transform = 'translateY(0)';
            }}
          >
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '2.8125rem',
              fontWeight: '100',
              letterSpacing: '0.9px',
              lineHeight: '1.3',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              Next project
            </span>
            
            <h2 style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '6.25rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              lineHeight: '0.8',
              margin: 0,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'left center'
            }}>
              {nextProject.title}
            </h2>
            
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.3125rem',
              fontWeight: '400',
              letterSpacing: '0.84px',
              textTransform: 'uppercase',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {nextProject.tags?.join(' • ')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    projectUrl: PropTypes.string
  }),
  projects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    projectUrl: PropTypes.string
  }))
};

export default Modal;