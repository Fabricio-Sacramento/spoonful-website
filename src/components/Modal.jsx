import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, project, projects = [] }) => {
  const modalRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Encontra o índice do projeto atual
  useEffect(() => {
    if (project && projects.length > 0) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  // Navegação com loop infinito
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
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--neutral-normal)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
        overflowY: 'auto'
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

      {/* HERO SECTION - Imagem em cima, texto embaixo */}
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Project Image - TOP - 50% da tela */}
        <div style={{
          height: '50vh', // Exatamente 50% da viewport
          backgroundColor: '#00ebff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <img 
            src={currentProject.image}
            alt={currentProject.title}
            style={{
              maxWidth: '60%',
              maxHeight: '60%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            onError={() => {
              console.log('Image failed to load:', currentProject.image);
            }}
          />
        </div>

        {/* Project Description - BOTTOM - 50% da tela */}
        <div style={{
          height: '50vh', // Exatamente 50% da viewport
          backgroundColor: 'var(--neutral-normal)',
          padding: '2rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Tags */}
          <div style={{
            color: 'var(--primary-green)',
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
            fontSize: '1.125rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.72px'
          }}>
            {currentProject.tags?.join(' • ') || 'WEBSITE • E-COMMERCE • UI/UX • DEVELOPMENT'}
          </div>

          {/* Title */}
          <h1 style={{
            color: 'var(--neutral-light)',
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
            fontSize: 'clamp(3rem, 8vw, 7.75rem)',
            fontWeight: '900',
            lineHeight: '0.9',
            letterSpacing: '2.48px',
            margin: 0
          }}>
            {currentProject.title}
          </h1>

          {/* Subtitle and Description Row */}
          <div style={{ display: 'flex', gap: '4rem' }}>
            {/* Left Column - Description */}
            <div style={{ flex: 2 }}>
              <h2 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.375rem',
                fontWeight: '500',
                letterSpacing: '0.88px',
                margin: '0 0 1rem 0'
              }}>
                Plataforma de Ecoturismo Sustentável
              </h2>
              
              <p style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.25rem',
                fontWeight: '300',
                letterSpacing: '1px',
                lineHeight: '1.4',
                margin: 0
              }}>
                {currentProject.description}
              </p>
            </div>

            {/* Right Columns - Stacks and Link */}
            <div style={{ flex: 1, display: 'flex', gap: '3rem' }}>
              {/* Design Stack */}
              <div>
                <h3 style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: '500',
                  letterSpacing: '0.68px',
                  textTransform: 'capitalize',
                  margin: '0 0 0.625rem 0'
                }}>
                  Design Stack
                </h3>
                <p style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '300',
                  letterSpacing: '1px',
                  margin: '0 0 2rem 0'
                }}>
                  Brand Strategy, UI/UX, Graphic Design, Front-end & Backend Development
                </p>

                <h3 style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: '500',
                  letterSpacing: '0.68px',
                  textTransform: 'capitalize',
                  margin: '0 0 0.625rem 0'
                }}>
                  Tech Stack
                </h3>
                <p style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '300',
                  letterSpacing: '1px',
                  margin: 0
                }}>
                  React • Node.js • Stripe • MongoDB
                </p>
              </div>

              {/* Go Live */}
              {currentProject.projectUrl && (
                <div>
                  <h3 style={{
                    color: 'var(--neutral-light)',
                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: '500',
                    letterSpacing: '0.68px',
                    textTransform: 'capitalize',
                    margin: '0 0 0.625rem 0'
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
                      fontWeight: '300',
                      letterSpacing: '1px',
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
      </div>

      {/* GALLERY SECTION - 5 imagens sequenciais */}
      <div style={{
        backgroundColor: 'var(--neutral-normal)',
        padding: '2rem',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 5 Single Images */}
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: '100%',
              height: '400px',
              borderRadius: '25px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#00ebff'
              }} />
              <img 
                src={currentProject.image}
                alt={`${currentProject.title} - Gallery ${i + 1}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION SECTION */}
      <div style={{
        height: '400px',
        display: 'flex',
        backgroundColor: 'var(--primary-red)',
        width: '100%',
        position: 'relative',
        zIndex: 2,
        marginTop: 0
      }}>
        {/* Previous Project */}
        <button
          onClick={goToPrevious}
          style={{
            flex: 1,
            display: 'flex',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            overflow: 'hidden'
          }}
        >
          {/* Previous Project Info */}
          <div style={{
            flex: 1,
            backgroundColor: 'var(--primary-red)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '2rem',
            textAlign: 'right'
          }}>
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '2.8125rem',
              fontWeight: '100',
              letterSpacing: '0.9px',
              lineHeight: '1.3'
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
              margin: 0
            }}>
              {prevProject.title}
            </h2>
            
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.3125rem',
              fontWeight: '400',
              letterSpacing: '0.84px',
              textTransform: 'uppercase'
            }}>
              {prevProject.tags?.join(' • ')}
            </span>
          </div>

          {/* Previous Project Image */}
          <div style={{
            flex: 1,
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
        </button>

        {/* Next Project */}
        <button
          onClick={goToNext}
          style={{
            flex: 1,
            display: 'flex',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            overflow: 'hidden'
          }}
        >
          {/* Next Project Image */}
          <div style={{
            flex: 1,
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

          {/* Next Project Info */}
          <div style={{
            flex: 1,
            backgroundColor: 'var(--primary-red)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '2rem',
            textAlign: 'left'
          }}>
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '2.8125rem',
              fontWeight: '100',
              letterSpacing: '0.9px',
              lineHeight: '1.3'
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
              margin: 0
            }}>
              {nextProject.title}
            </h2>
            
            <span style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '1.3125rem',
              fontWeight: '400',
              letterSpacing: '0.84px',
              textTransform: 'uppercase'
            }}>
              {nextProject.tags?.join(' • ')}
            </span>
          </div>
        </button>
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